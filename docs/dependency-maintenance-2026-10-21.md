# Targeted OpenZeppelin refresh — 2026-10-21

This change updates OpenZeppelin's 4.x contracts packages from 4.8.0 to 4.9.6.
The existing ethers manifest range and locked 5.7.2 version remain unchanged.
It does not migrate Hardhat, Waffle, LayerZero, Uniswap, Solidity, contract
interfaces, network configuration, or deployments.

## Selection and compatibility boundaries

- [OpenZeppelin's advisory](https://github.com/OpenZeppelin/openzeppelin-contracts/security/advisories/GHSA-9vx6-7xxf-x967)
  identifies 4.9.6 as a patched 4.x release. Other package-level findings in
  4.8.0 also motivate refreshing the lockfile. A package-range match does not
  mean this project's imported contracts exercise an affected feature.
- LayerZero 0.0.6 accepts contracts `^4.4.1` and upgradeable contracts
  `^4.6.0`; 4.9.6 satisfies both. Narrow resolutions keep those transitive
  selections aligned with the direct contracts dependency.
- Uniswap v3-periphery's exact `3.4.2-solc-0.7` OpenZeppelin pin is preserved.
  Forcing every instance to 4.x would violate that parent's constraint.
- No current project contract imports `contracts-upgradeable`; that update is
  dependency hygiene, not a claimed change to deployed contracts.
- An ethers 5.8.0 candidate was evaluated but **not included**. Its providers
  package exactly pins ws 8.18.0, which has newer catalog findings. Overriding
  that exact pin without adequate regression evidence is outside this patch.

## Verification and the full-suite blocker

`yarn test:dependencies` checks installed OpenZeppelin versions and actual
LayerZero parent paths, the preserved Uniswap and ethers selections, and
offline ethers signing/recovery, amount arithmetic, and ABI encoding. It
does not contact an RPC or broadcast a transaction.

Independent offline checks passed: compilation/ABI/recursive-storage
comparison for all nine current project Solidity sources, using official
solc 0.8.17 with optimization enabled and 200 runs. The committed compilation
fixture's 26 external imports were byte-verified against the original locked
dependency sources. This is not a substitute for the unit suite.

The full existing Hardhat suite is **not verified**. Its gas reporter attempted
an external CoinMarketCap API request after baseline compilation succeeded;
execution was blocked by the review gate because the outbound payload and any
environment-derived credentials were not established as authorized. No test
pass is claimed, no reporter-disable workaround was used, and the final
candidate full suite was not run after that gate. Resuming the rejected
action needs explicit authorization. Its session's terminal state was not
confirmed. A local Hardhat network alone does not guarantee offline tests.

The original `yarn lint` runs `prettier --write`; it is not a read-only check.
Checks use Node 18.20.8 for compatibility with the old toolchain, not the
host's Node 24. [Node 18 is end-of-life](https://nodejs.org/en/about/previous-releases);
this isolated check is not a deployment-runtime recommendation.

## Remaining risk

This is **not** a clean security bill of health. The original Yarn inventory
matched 229 npm advisory records across 67 package names. These are catalog
range matches, not dependency-instance counts, proven exploits, or GitHub
Dependabot alert counts. The final inventory is compared against the already
obtained same-day official catalog snapshot; no alert enumeration is claimed.

Every final name-version pair is covered by the actual official response
obtained at 19:23:18 UTC. Re-matching that snapshot against the final 1,071
names / 1,363 distinct name-version pairs reports **215 records across 65
names** (15 critical, 100 high, 67 moderate, 33 low). This is not a new network
scan or a count of fixed exploits.

Legacy Waffle/Ganache, Hardhat, deployment, ethers/cryptography, HTTP and
WebSocket subtrees still need separately scoped remediation and regression.
Retaining ethers 5.7.2 is not a claim that it or its dependencies are secure.
Do not silently override incompatible exact pins or make blanket major
upgrades simply to reduce audit totals.

The original `ethereumjs-abi` Git source remains fixed at commit
`ee3994657fa7a427238e6ba92a84d0b529bbcde0`, with a commit pin rather than a
registry SRI value. No historical commits or contributor identities were
rewritten. No deployment, live-chain transaction, or account configuration
change is included; source changes do not alter existing deployments.
