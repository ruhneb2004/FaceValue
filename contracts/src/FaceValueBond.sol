// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FaceValueBond
 * @notice Holds dispute stakes and moves money. It never decides identity.
 *
 *   identity  <- decided off-chain, deterministically (face embedding, thresholds)
 *   money     <- decided on-chain, by this contract, from that one boolean
 *
 * The only thing this contract ever learns about a face is a `bool`. It never
 * sees an image, an embedding, a nullifier or a match score. That is what keeps
 * "the face decides, not a vote" true even though the money is on-chain.
 *
 * Trust boundary, stated plainly: MATCHER_ROLE is trusted for exactly one
 * boolean, and can therefore settle the wrong way. The guarantee against that is
 * off-chain — deterministic thresholds and a logged `cos` per call — not this
 * contract. It is better to say so than to imply the matcher is trustless.
 *
 * There is deliberately no owner-withdraw, no sweep and no upgradability. A key
 * that can empty the pot is the centralisation this contract exists to remove.
 */
contract FaceValueBond {
    /* ── errors ──────────────────────────────────────────────────────────── */

    error AlreadyStaked();
    error NothingStaked();
    error StakeMismatch(uint256 required, uint256 sent);
    error ChallengeNotOpen();
    error AlreadySettled();
    error NotMatcher();
    error NotResolver();
    error AlreadyApproved();
    error NoQuorum();
    error SplitVerdict();
    error TransferFailed();
    error ZeroAddress();

    /* ── events ──────────────────────────────────────────────────────────── */

    event Staked(bytes32 indexed likenessId, address indexed staker, uint256 amount);
    event Challenged(
        bytes32 indexed likenessId,
        bytes32 indexed challengeId,
        address challenger,
        uint256 amount
    );
    event ReviewApproved(bytes32 indexed challengeId, address resolver, bool verdict);
    event Resolved(bytes32 indexed likenessId, bytes32 indexed challengeId, bool faceWins, uint8 tier);
    event Withdrawn(address indexed who, uint256 amount);

    /* ── types ───────────────────────────────────────────────────────────── */

    struct Likeness {
        address registrant;
        uint256 registrantStake;
        uint256 challengerPool; // sum of every challenger stake, winner's included
        bool settled;
    }

    struct Challenge {
        bytes32 likenessId;
        address challenger;
        uint256 stake;
        uint8 approvals;  // distinct RESOLVER approvals for `true`
        uint8 rejections; // distinct RESOLVER approvals for `false`
        bool open;
    }

    /* ── storage ─────────────────────────────────────────────────────────── */

    mapping(bytes32 => Likeness) public likenesses;
    mapping(bytes32 => Challenge) public challenges;

    /// Withdrawable balance. Pull pattern: payouts credit, recipients withdraw.
    mapping(address => uint256) public credit;

    /// One stake per address per likeness. Stops double-staking to inflate a
    /// pool, and stops a registrant also challenging its own likeness.
    mapping(bytes32 => mapping(address => bool)) public hasStaked;

    /// One approval per resolver per challenge. This mapping — not any database
    /// index — is what actually prevents a double vote.
    mapping(bytes32 => mapping(address => bool)) public hasApproved;

    bytes32 public constant MATCHER_ROLE = keccak256("MATCHER_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    mapping(bytes32 => mapping(address => bool)) private _roles;

    uint8 public constant QUORUM = 2;

    /* ── access control ──────────────────────────────────────────────────── */

    modifier onlyRole(bytes32 role) {
        if (!_roles[role][msg.sender]) revert NotMatcher();
        _;
    }

    /// @dev The deployer is the initial admin and can grant roles during setup.
    ///      There is intentionally no way to revoke a role's ability to move
    ///      funds, and no admin path to funds at all.
    constructor() {
        _roles[0x00][msg.sender] = true; // admin sentinel
    }

    modifier onlyAdmin() {
        require(_roles[0x00][msg.sender], "not admin");
        _;
    }

    function grantRole(bytes32 role, address who) external onlyAdmin {
        if (who == address(0)) revert ZeroAddress();
        _roles[role][who] = true;
    }

    function hasRole(bytes32 role, address who) external view returns (bool) {
        return _roles[role][who];
    }

    /* ── stake ───────────────────────────────────────────────────────────── */

    /**
     * @notice Registrar posts the bond for a likeness.
     * @dev `hasStaked` is per address per likeness, so this reverts on a second
     *      call from the same address — a registrant cannot top up to make a
     *      squat more expensive, which would break equal stakes in `challenge`.
     */
    function stake(bytes32 likenessId) external payable {
        if (hasStaked[likenessId][msg.sender]) revert AlreadyStaked();
        if (msg.value == 0) revert NothingStaked();

        Likeness storage l = likenesses[likenessId];
        if (l.registrant == address(0)) {
            l.registrant = msg.sender;
        } else if (l.registrant != msg.sender) {
            // A second party cannot claim an already-staked likeness.
            revert AlreadyStaked();
        }

        l.registrantStake = msg.value;
        hasStaked[likenessId][msg.sender] = true;

        emit Staked(likenessId, msg.sender, msg.value);
    }

    /**
     * @notice Challenger posts an equal stake against a likeness.
     * @dev Equal stakes are the whole point: a challenge must cost the challenger
     *      exactly what the registrant stands to lose, or it is a free option.
     */
    function challenge(bytes32 likenessId, bytes32 challengeId) external payable {
        Likeness storage l = likenesses[likenessId];
        if (l.registrant == address(0) || l.settled) revert NothingStaked();
        if (hasStaked[likenessId][msg.sender]) revert AlreadyStaked();
        if (msg.value != l.registrantStake) revert StakeMismatch(l.registrantStake, msg.value);
        if (challenges[challengeId].challenger != address(0)) revert AlreadyStaked();

        challenges[challengeId] = Challenge({
            likenessId: likenessId,
            challenger: msg.sender,
            stake: msg.value,
            approvals: 0,
            rejections: 0,
            open: true
        });
        hasStaked[likenessId][msg.sender] = true;
        l.challengerPool += msg.value;

        emit Challenged(likenessId, challengeId, msg.sender, msg.value);
    }

    /* ── settlement ──────────────────────────────────────────────────────── */

    /**
     * @notice Settle a challenge from the matcher's single boolean.
     * @param faceWins true when the challenger's face matched the frozen reference.
     *
     * Payout follows the face. On a win the challenger takes the whole pot,
     * including the losing challengers' stakes — not the registrant. Tying every
     * stake to the face's answer is what makes a spurious challenge always cost
     * the challenger and always benefit whoever was right.
     */
    function resolveTier1(bytes32 likenessId, bytes32 challengeId, bool faceWins)
        external
        onlyRole(MATCHER_ROLE)
    {
        Challenge storage c = challenges[challengeId];
        if (!c.open) revert ChallengeNotOpen();

        _settle(likenessId, challengeId, faceWins, 1);
    }

    /** @notice A resolver records their verdict on a gray-band challenge. */
    function approveReview(bytes32 challengeId, bool verdict) external onlyRole(RESOLVER_ROLE) {
        Challenge storage c = challenges[challengeId];
        if (!c.open) revert ChallengeNotOpen();
        if (hasApproved[challengeId][msg.sender]) revert AlreadyApproved();

        hasApproved[challengeId][msg.sender] = true;
        if (verdict) {
            c.approvals += 1;
        } else {
            c.rejections += 1;
        }

        emit ReviewApproved(challengeId, msg.sender, verdict);
    }

    /**
     * @notice Settles once a quorum shares one verdict. Permissionless by design:
     *         once the resolvers have spoken, anyone may hand over the result.
     */
    function resolveReview(bytes32 challengeId) external {
        Challenge storage c = challenges[challengeId];
        if (!c.open) revert ChallengeNotOpen();

        bool faceWins;
        if (c.approvals >= QUORUM && c.rejections == 0) {
            faceWins = true;
        } else if (c.rejections >= QUORUM && c.approvals == 0) {
            faceWins = false;
        } else if (c.approvals >= QUORUM && c.rejections >= QUORUM) {
            revert SplitVerdict();
        } else {
            revert NoQuorum();
        }

        _settle(c.likenessId, challengeId, faceWins, 3);
    }

    function _settle(bytes32 likenessId, bytes32 challengeId, bool faceWins, uint8 tier) private {
        Likeness storage l = likenesses[likenessId];
        Challenge storage c = challenges[challengeId];
        if (l.settled) revert AlreadySettled();
        if (!c.open) revert ChallengeNotOpen();

        // Effects before any transfer. The pot is the registrant's stake plus
        // every challenger stake; `challengerPool` already includes the winner's.
        uint256 pot = l.registrantStake + l.challengerPool;

        l.settled = true;
        c.open = false;

        address winner = faceWins ? c.challenger : l.registrant;
        credit[winner] += pot;

        emit Resolved(likenessId, challengeId, faceWins, tier);
    }

    /* ── money out ───────────────────────────────────────────────────────── */

    /**
     * @notice Pull the caller's credit.
     * @dev Pull, never push: a reverting recipient cannot brick a resolution, and
     *      one settle call stays O(1) instead of N transfers.
     */
    function withdraw() external {
        uint256 amount = credit[msg.sender];
        if (amount == 0) return; // idempotent: a second withdraw is a no-op, not a hit

        // Checks-effects-interactions. The credit is zeroed and the event emitted
        // before the external call, so a reentrant recipient can neither take the
        // money twice nor fabricate or reorder the Withdrawn log that off-chain
        // consumers (HCS mirrors) rely on.
        credit[msg.sender] = 0;
        emit Withdrawn(msg.sender, amount);

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    /* ── views ───────────────────────────────────────────────────────────── */

    function stakes(bytes32 likenessId) external view returns (uint256 registrant, uint256 challengerPool) {
        Likeness storage l = likenesses[likenessId];
        return (l.registrantStake, l.challengerPool);
    }

    receive() external payable {
        revert NothingStaked();
    }
}
