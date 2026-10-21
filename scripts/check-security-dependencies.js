// Offline smoke checks for the narrow dependency update; no RPC or transaction.
const assert = require("node:assert/strict")
const path = require("node:path")
const { ethers } = require("ethers")

function packageFrom(name, from) {
    return require(require.resolve(`${name}/package.json`, { paths: [from] }))
}

async function main() {
    const root = path.resolve(__dirname, "..")
    const layerZero = path.dirname(require.resolve("@layerzerolabs/solidity-examples/package.json"))
    const uniswapV3 = path.dirname(require.resolve("@uniswap/v3-periphery/package.json"))

    // The separately evaluated ethers upgrade is not part of this OZ-only patch.
    assert.equal(packageFrom("ethers", root).version, "5.7.2")
    assert.equal(packageFrom("@openzeppelin/contracts", root).version, "4.9.6")
    assert.equal(packageFrom("@openzeppelin/contracts", layerZero).version, "4.9.6")
    assert.equal(packageFrom("@openzeppelin/contracts-upgradeable", layerZero).version, "4.9.6")
    // Uniswap explicitly requires the Solidity-0.7 branch; do not force OZ 4 there.
    assert.equal(packageFrom("@openzeppelin/contracts", uniswapV3).version, "3.4.2-solc-0.7")

    // An ephemeral local key, never a funded account or user-provided credential.
    const wallet = ethers.Wallet.createRandom()
    const message = "mainnet-testnet-bridge dependency compatibility"
    const signature = await wallet.signMessage(message)
    assert.equal(ethers.utils.verifyMessage(message, signature), wallet.address)
    const digest = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message))
    assert.equal(ethers.utils.recoverAddress(digest, wallet._signingKey().signDigest(digest)), wallet.address)

    const value = ethers.utils.parseEther("1")
    assert.equal(value.add(value).toString(), "2000000000000000000")
    const iface = new ethers.utils.Interface(["function transfer(address to,uint256 value)"])
    const data = iface.encodeFunctionData("transfer", [wallet.address, value])
    const decoded = iface.decodeFunctionData("transfer", data)
    assert.equal(decoded.to, wallet.address)
    assert(decoded.value.eq(value))
    console.log("Dependency versions, parent paths, ethers signing/recovery, units, and ABI encoding passed.")
}

main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
})
