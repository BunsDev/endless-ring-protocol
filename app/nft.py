import pydub
import numpy as np
import matplotlib.pyplot as plt
import datetime
import requests
import json
from web3 import Web3, HTTPProvider
from web3.middleware import geth_poa_middleware
import subprocess
from dotenv import load_dotenv
import os

try:
    load_dotenv("../.env")
except Exception as e:
    print('no .env file found, loading placeholders')
    load_dotenv("../.placeholderenv")

def mp3_to_numpy(dir, f, normalized=False):
    """MP3 to numpy array"""
    a = pydub.AudioSegment.from_mp3(dir + f)
    y = np.array(a.get_array_of_samples())
    if a.channels == 2:
        y = y.reshape((-1, 2))
    if normalized:
        return a.frame_rate, np.float32(y) / 2**15
    else:
        return a.frame_rate, y


def generate_waveform(dir, f):
    """Generate waveform from mp3 file"""
    data = mp3_to_numpy(dir, f)[1]
    # plot the waveform
    fig, ax = plt.subplots()
    ax.axis("off")
    # set square canvas
    fig.set_size_inches(42, 42)
    # add background image to canvas @hugo
    background = plt.imread("media/goldtexture.jpg")
    background = ax.imshow(background, extent=[0, 1200, 0, 1200])
    # plot waveform in dark brown  @hugo (previously was black color='k')
    ax.plot(data, color="#4d2a03")
    # save the figure
    utcnow = datetime.datetime.utcnow()
    img_name = "waveform.png"
    fig.savefig(f"{dir}/{img_name}", dpi=100, bbox_inches="tight", pad_inches=0)
    return img_name


def upload_files(dir, image, audio):
    """
    SAMPLE USAGE:
    curl -X 'POST' \
        'https://api.nft.storage/upload' \
        -H 'accept: application/json' \
        -H 'Content-Type: multipart/form-data' \
        -H 'Authorization: Bearer WyIweGI5NDY0OT...' \
        -F 'file=@test.jpg;type=image/jpeg' \
        -F 'file=@test.png;type=image/png' \
        -F 'file=@test.mp3;type=audio/mpeg'
    """
    url = "https://api.nft.storage/upload"
    token = os.getenv("nft_storage_api_key")
    # use subprocess curl to upload files
    command = f"curl -X 'POST' \
        '{url}' \
        -H 'accept: application/json' \
        -H 'Content-Type: multipart/form-data' \
        -H 'Authorization: Bearer {token}' \
        -F 'file=@{dir}/{image};type=image/png' \
        -F 'file=@{dir}/{audio};type=audio/mpeg'"
    print(command)
    output = subprocess.check_output(command, shell=True)
    response = json.loads(output)
    cid = response["value"]["cid"]
    sound_uri = f"ipfs://{cid}/{audio}"
    img_uri = f"ipfs://{cid}/{image}"
    return cid, sound_uri, img_uri


def upload_metadata(dir, sound_uri, img_uri):
    """Create metadata for NFT"""
    metadata = {
        "name": "An audio NFT",
        "description": "This is an audio NFT",
        "image": f"{img_uri}",
        "mp3": f"{sound_uri}",
        "animation_url": f"ipfs://{sound_uri}",
        "external_url": f"https://endless.place/i/{dir}",
    }

    # save metadata to dir
    with open(f"{dir}/metadata.json", "w") as f:
        json.dump(metadata, f)

    url = "https://api.nft.storage/upload"
    token = os.getenv("nft_storage_api_key")
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }
    response = requests.post(url, headers=headers, data=json.dumps(metadata))
    cid = response.json()["value"]["cid"]
    return cid


def create_nft(dir, audio_file, to_address):
    """Create waveform NFT from mp3 file"""

    waveform_file = generate_waveform(dir, audio_file)
    cid, sound_uri, img_uri = upload_files(dir, waveform_file, audio_file)
    metadata_cid = upload_metadata(dir, sound_uri, img_uri)

    to_address = Web3.toChecksumAddress(to_address)

    PRIVATE_KEY = os.getenv("PRIVATE_KEY")
    INFURA_ID = os.getenv("WEB3_INFURA_PROJECT_ID")
    # now we mint the nft with contract.mint(token_uri, to)
    # contract_address = "0x0A1E0dfdcF8763415BC9c112B999A00bAbd1b491"  # rinkeby
    # contract_address = "0x6F8228d3458A23962dF4A13697F13F1689d791b7" # POLYGON MAINNET (on hold)
    contract_address = "0x0D3492437E86dabb67F2bCfAE5c597D2edA67D65" # MUMBAI
    INFURA_URL = f"https://polygon-mumbai.infura.io/v3/{INFURA_ID}"

    web3 = Web3(HTTPProvider(INFURA_URL))
    web3.middleware_onion.inject(geth_poa_middleware, layer=0)
    web3.eth.defaultAccount = web3.eth.account.privateKeyToAccount(PRIVATE_KEY).address



    with open("abi.json") as f:
        contract_abi = json.load(f)
    # to_address = "0x6B3751c5b04Aa818EA90115AA06a4D9A36A16f02"
    contract = web3.eth.contract(address=contract_address, abi=contract_abi)

    # create and sign transaction
    txn = contract.functions.mint(metadata_cid, to_address).buildTransaction(
        {
            "nonce": web3.eth.getTransactionCount(web3.eth.defaultAccount),
            "gas": 1000000,
            # "gasPrice": web3.toWei("3", "gwei"),
            # "value": 0,
            # prior
        }
    )
    signed_txn = web3.eth.account.signTransaction(txn, PRIVATE_KEY)
    tx_hash = web3.eth.sendRawTransaction(signed_txn.rawTransaction)
    tx_receipt = web3.eth.waitForTransactionReceipt(tx_hash)
    token_id = tx_receipt.logs[0]["topics"][3]

    # decode
    token_id = web3.toInt(token_id)
    tx_hash = web3.toHex(tx_hash)
    return tx_hash, token_id, img_uri, sound_uri


# if __name__ == "__main__":

#     # test call
#     dir = "uploads/5/"
#     sound_file = "audio.mp3"
#     to_address = "0x6B3751c5b04Aa818EA90115AA06a4D9A36A16f02"
#     tx, id = create_nft(dir, sound_file, to_address)
#     print(f"tx, id: {tx}, {id}")
