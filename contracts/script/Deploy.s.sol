// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {FaceValueBond} from "../src/FaceValueBond.sol";

/**
 * Deploys FaceValueBond to Hedera EVM testnet (chain 296).
 *
 *   forge script script/Deploy.s.sol --rpc-url $HEDERA_RPC_URL --broadcast \
 *     --private-key $DEPLOYER_PRIVATE_KEY
 *
 * Roles are granted here so the contract leaves setup in a usable state:
 *  - MATCHER_ROLE  -> MATCHER_ADDRESS (the backend key that passes the boolean)
 *  - RESOLVER_ROLE -> RESOLVER_1/2/3 (the three review addresses)
 *
 * The deployer keeps the admin sentinel and nothing else: it cannot withdraw,
 * resolve or approve. That is deliberate — see src/FaceValueBond.sol.
 */
contract Deploy is Script {
    function run() external {
        address matcher = vm.envAddress("MATCHER_ADDRESS");
        address r1 = vm.envAddress("RESOLVER_1");
        address r2 = vm.envAddress("RESOLVER_2");
        address r3 = vm.envAddress("RESOLVER_3");

        vm.startBroadcast();
        FaceValueBond bond = new FaceValueBond();
        bond.grantRole(bond.MATCHER_ROLE(), matcher);
        bond.grantRole(bond.RESOLVER_ROLE(), r1);
        bond.grantRole(bond.RESOLVER_ROLE(), r2);
        bond.grantRole(bond.RESOLVER_ROLE(), r3);
        vm.stopBroadcast();

        console.log("FaceValueBond deployed at:", address(bond));
        console.log("chain id:", block.chainid);
    }
}
