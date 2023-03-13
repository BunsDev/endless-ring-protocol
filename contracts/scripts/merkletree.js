const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")


// load /addresses.csv
const addresses = []
const addressesFile = "./addresses.csv"
const fs = require("fs")
fs.readFileSync(addressesFile).toString().split('\n').forEach(line => {
    const [address, value] = line.split(',')
    addresses.push(address)
}
)


// print last 10 addresses
console.log("last 10 addresses:")
for (let i = 0; i < 10; i++) {
    console.log(addresses[addresses.length - i - 1])
}


// Hash addresses to get the leaves
let leaves = addresses.map(addr => keccak256(addr))
// Create tree
let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
let rootHash = merkleTree.getRoot().toString('hex')
console.log("rootHash (no shift): " + rootHash)

// remove first entry (header)
addresses.shift()
leaves = addresses.map(addr => keccak256(addr))
merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
rootHash = merkleTree.getRoot().toString('hex')
console.log("rootHash (shift): " + rootHash)


// save roothash to file
fs.writeFileSync("./rootHash.txt", rootHash)


testAdresses = [
    "0x78c115f1c8b7d0804fbdf3cf7995b030c512ee78",
    "0x6B3751c5b04Aa818EA90115AA06a4D9A36A16f02",
    "0x382b4ca2c4a7cd28c1c400c69d81ec2b2637f7dd",
    "0x1bdae8d8c66badc1d02fe9f58e1586fb00d21b87",
    "fsainhuoasbfjusabfj",
    "GIBBERISH",
    "web3 is all i know",
    "web3 is all i neeeeeeeed",
    "1254875215"
]

// test if the addresses are in the tree
testAdresses.forEach(addr => {
    let leaf = keccak256(addr)
    let hexProof = merkleTree.getHexProof(leaf)
    console.log(hexProof)
    // if hexProof list is empty, the leaf is not in the tree
    if (hexProof.length === 0) {
        console.log(`NO: ${addr}`)
    } else {
        console.log(`YES: ${addr}`)
    }
    console.log("\n")
}
)
