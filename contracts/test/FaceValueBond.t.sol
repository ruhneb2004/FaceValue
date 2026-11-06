// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FaceValueBond} from "../src/FaceValueBond.sol";

/**
 * The eleven tests in docs/bond-contract.md §9, in order.
 *
 * These are the money tests. Each one is a property the demo claims out loud, so
 * a failure here means the stage claim is false, not that a test is fussy.
 */
contract FaceValueBondTest is Test {
    FaceValueBond bond;

    bytes32 constant MATCHER_ROLE = keccak256("MATCHER_ROLE");
    bytes32 constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    address admin = address(0xA11CE);
    address matcher = address(0xCAFE);
    address registrant = address(0xB0B);
    address challengerA = address(0xC1);
    address challengerB = address(0xC2);
    address resolver1 = address(0xD1);
    address resolver2 = address(0xD2);
    address resolver3 = address(0xD3);

    bytes32 constant LIKENESS = keccak256("likeness-1");
    bytes32 constant CH_A = keccak256("challenge-a");
    bytes32 constant CH_B = keccak256("challenge-b");
    bytes32 constant CH_C = keccak256("challenge-c");

    uint256 constant STAKE = 2 ether;

    function setUp() public {
        vm.prank(admin);
        bond = new FaceValueBond();
        vm.startPrank(admin);
        bond.grantRole(MATCHER_ROLE, matcher);
        bond.grantRole(RESOLVER_ROLE, resolver1);
        bond.grantRole(RESOLVER_ROLE, resolver2);
        bond.grantRole(RESOLVER_ROLE, resolver3);
        vm.stopPrank();

        vm.deal(registrant, 100 ether);
        vm.deal(challengerA, 100 ether);
        vm.deal(challengerB, 100 ether);
    }

    /// Registrant stakes and one challenger matches it. The common setup.
    function _opened() internal returns (bytes32) {
        vm.prank(registrant);
        bond.stake{value: STAKE}(LIKENESS);
        vm.prank(challengerA);
        bond.challenge{value: STAKE}(LIKENESS, CH_A);
        return CH_A;
    }

    /* ── 1. double stake from one address reverts ─────────────────────────── */
    function test_1_secondStakeFromSameAddressReverts() public {
        vm.startPrank(registrant);
        bond.stake{value: STAKE}(LIKENESS);
        vm.expectRevert(FaceValueBond.AlreadyStaked.selector);
        bond.stake{value: STAKE}(LIKENESS);
        vm.stopPrank();
    }

    /* ── 2. unequal challenge stake reverts ───────────────────────────────── */
    function test_2_challengeWithWrongStakeReverts() public {
        vm.prank(registrant);
        bond.stake{value: STAKE}(LIKENESS);

        vm.prank(challengerA);
        vm.expectRevert(
            abi.encodeWithSelector(FaceValueBond.StakeMismatch.selector, STAKE, STAKE - 1)
        );
        bond.challenge{value: STAKE - 1}(LIKENESS, CH_A);
    }

    /* ── 3. non-matcher cannot settle ─────────────────────────────────────── */
    function test_3_nonMatcherCannotResolveTier1() public {
        bytes32 ch = _opened();
        vm.prank(challengerA);
        vm.expectRevert(FaceValueBond.NotMatcher.selector);
        bond.resolveTier1(LIKENESS, ch, true);
    }

    /* ── 4. tier 1 win: challenger takes the whole pot ─────────────────────── */
    function test_4_tier1WinPaysChallengerWholePot() public {
        bytes32 ch = _opened();
        vm.prank(matcher);
        bond.resolveTier1(LIKENESS, ch, true);

        // registrant stake + challenger pool, i.e. everything.
        assertEq(bond.credit(challengerA), STAKE + STAKE);
        assertEq(bond.credit(registrant), 0);
    }

    /* ── 5. tier 1 loss: registrant takes the whole pot ────────────────────── */
    function test_5_tier1LossPaysRegistrantWholePot() public {
        bytes32 ch = _opened();
        vm.prank(matcher);
        bond.resolveTier1(LIKENESS, ch, false);

        assertEq(bond.credit(registrant), STAKE + STAKE);
        assertEq(bond.credit(challengerA), 0);
    }

    /* ── 6. one approval per resolver ─────────────────────────────────────── */
    function test_6_sameResolverCannotApproveTwice() public {
        bytes32 ch = _opened();
        vm.startPrank(resolver1);
        bond.approveReview(ch, true);
        vm.expectRevert(FaceValueBond.AlreadyApproved.selector);
        bond.approveReview(ch, true);
        vm.stopPrank();
    }

    /* ── 7. split verdicts cannot resolve ─────────────────────────────────── */
    function test_7_splitVerdictHasNoQuorum() public {
        bytes32 ch = _opened();
        vm.prank(resolver1);
        bond.approveReview(ch, true);
        vm.prank(resolver2);
        bond.approveReview(ch, false);

        vm.expectRevert(FaceValueBond.NoQuorum.selector);
        bond.resolveReview(ch);
    }

    /* ── 8. matching quorum settles ───────────────────────────────────────── */
    function test_8_twoMatchingApprovalsSettle() public {
        bytes32 ch = _opened();
        vm.prank(resolver1);
        bond.approveReview(ch, true);
        vm.prank(resolver2);
        bond.approveReview(ch, true);

        // Permissionless: any caller can hand over a decided review.
        vm.prank(address(0xE1E));
        bond.resolveReview(ch);

        assertEq(bond.credit(challengerA), STAKE + STAKE);
    }

    /* ── 9. withdraw twice is not a double pay ────────────────────────────── */
    function test_9_secondWithdrawIsNoOp() public {
        bytes32 ch = _opened();
        vm.prank(matcher);
        bond.resolveTier1(LIKENESS, ch, true);

        uint256 before = challengerA.balance;
        vm.prank(challengerA);
        bond.withdraw();
        assertEq(challengerA.balance, before + (STAKE * 2));

        // Second call pays nothing and does not revert.
        vm.prank(challengerA);
        bond.withdraw();
        assertEq(challengerA.balance, before + (STAKE * 2));
        assertEq(bond.credit(challengerA), 0);
    }

    /* ── 10. cannot settle twice ──────────────────────────────────────────── */
    function test_10_resolveSettledChallengeReverts() public {
        bytes32 ch = _opened();
        vm.prank(matcher);
        bond.resolveTier1(LIKENESS, ch, true);

        vm.prank(matcher);
        vm.expectRevert(FaceValueBond.ChallengeNotOpen.selector);
        bond.resolveTier1(LIKENESS, ch, true);
    }

    /* ── 11. the many-challenger rule ─────────────────────────────────────── */
    /// A third challenger stakes mid-dispute, then the registrant wins. The
    /// registrant must take all three stakes — this is the rule that makes a
    /// pile-on costly rather than profitable.
    function test_11_registrantWinsWithThreeStakes() public {
        bytes32 ch = _opened();

        // Two more challengers join while the dispute is open.
        vm.prank(challengerB);
        bond.challenge{value: STAKE}(LIKENESS, CH_B);

        address challengerC = address(0xC3);
        vm.deal(challengerC, 100 ether);
        vm.prank(challengerC);
        bond.challenge{value: STAKE}(LIKENESS, CH_C);

        (uint256 regStake, uint256 pool) = bond.stakes(LIKENESS);
        assertEq(regStake, STAKE);
        assertEq(pool, STAKE * 3);

        // Resolve A as a loss: the registrant defended.
        vm.prank(matcher);
        bond.resolveTier1(LIKENESS, ch, false);

        // Registrant takes the registrant stake plus every challenger's stake.
        assertEq(bond.credit(registrant), STAKE + (STAKE * 3));
        assertEq(bond.credit(challengerA), 0);
        assertEq(bond.credit(challengerB), 0);
        assertEq(bond.credit(challengerC), 0);
    }

    /* ── extra: the invariants behind the invariants ──────────────────────── */

    /// Losing challengers pay the winner, not the loser. This is what stops a
    /// registrant from farming challenges.
    function test_challengerWinTakesLosingChallengersStakes() public {
        bytes32 ch = _opened();
        vm.prank(challengerB);
        bond.challenge{value: STAKE}(LIKENESS, CH_B);

        vm.prank(matcher);
        bond.resolveTier1(LIKENESS, ch, true);

        // Three stakes in the pot: the registrant's and both challengers'.
        // A wins everything: its own stake, the registrant's, and B's.
        assertEq(bond.credit(challengerA), STAKE * 3);
        assertEq(bond.credit(registrant), 0);
        assertEq(bond.credit(challengerB), 0);
    }

    /// The contract must hold exactly the credited total: no money created or lost.
    function test_contractSolvency() public {
        bytes32 ch = _opened();
        vm.prank(challengerB);
        bond.challenge{value: STAKE}(LIKENESS, CH_B);

        vm.prank(matcher);
        bond.resolveTier1(LIKENESS, ch, true);

        uint256 credited = bond.credit(challengerA) + bond.credit(registrant) + bond.credit(challengerB);
        assertEq(credited, STAKE * 3);
        assertEq(address(bond).balance, credited);
    }

    /// A registrant cannot also challenge its own likeness.
    function test_registrantCannotChallengeOwnLikeness() public {
        vm.startPrank(registrant);
        bond.stake{value: STAKE}(LIKENESS);
        vm.expectRevert(FaceValueBond.AlreadyStaked.selector);
        bond.challenge{value: STAKE}(LIKENESS, CH_A);
        vm.stopPrank();
    }

    /// No owner-withdraw path exists: the admin cannot touch the pot.
    function test_adminHasNoWithdrawPath() public {
        _opened();
        vm.prank(admin);
        bond.withdraw();
        assertEq(bond.credit(admin), 0);
        assertEq(address(bond).balance, STAKE * 2);
    }

    /// A settled likeness rejects new challenges.
    function test_cannotChallengeSettledLikeness() public {
        bytes32 ch = _opened();
        vm.prank(matcher);
        bond.resolveTier1(LIKENESS, ch, true);

        vm.prank(challengerB);
        vm.expectRevert(FaceValueBond.NothingStaked.selector);
        bond.challenge{value: STAKE}(LIKENESS, CH_B);
    }

    /// The empty-approval case must not resolve.
    function test_noApprovalsCannotResolve() public {
        bytes32 ch = _opened();
        vm.expectRevert(FaceValueBond.NoQuorum.selector);
        bond.resolveReview(ch);
    }
}
