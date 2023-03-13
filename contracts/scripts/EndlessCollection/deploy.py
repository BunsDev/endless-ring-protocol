#!/usr/bin/python3

#############################################################################################
# Usage: 
# brownie run scripts/EndlessCollection/deploy.py
# brownie run scripts/EndlessCollection/deploy.py --network goerli
#
#
#############################################################################################

from brownie import EndlessCollection, accounts, network, config
from scripts.helpful_scripts import get_publish_source


def main():
    dev = accounts.add(config["wallets"]["from_key"])
    print(network.show_active())
    contract = EndlessCollection.deploy(
        {"from": dev},
        # https://explorer.execution.l16.lukso.network
        # publish_source=get_publish_source(),
        publish_source=False,
    )
    
    # Brownies console.log equivalent   
    # have to add emit events in contract...
    print()
    events = contract.tx.events # dictionary
    if "Log" in events:
        for e in events["Log"]:
            print(e['message'])
    print()

    # mint first nft
    token_uri = "ipfs://bafkreibppxajoavxdtxh5kosxhfxcq72xpkchfqlzm3gr5c6muzgpcrtai"
    to = "0x6B3751c5b04Aa818EA90115AA06a4D9A36A16f02"
    tx = contract.mint(token_uri, to, {"from": dev})
    tx.wait(1)
    print(tx)
    
    return contract
