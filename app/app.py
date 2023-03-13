from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    redirect,
    Response,
    make_response,
    send_file,
    flash,
    url_for,
)
import os
import random
from werkzeug.utils import secure_filename
import nft
from pydub import AudioSegment


app = Flask(__name__, static_folder="src", template_folder="src/html")
app.config.update(
    TEMPLATES_AUTO_RELOAD=True,
)
ALLOWED_EXTENSIONS = {"txt", "pdf", "png", "jpg", "jpeg", "gif"}


# always redirect to https (unless dev environment)
@app.before_request
def before_request():
    if request.url.startswith("http://") and not "127.0." in request.url:
        return redirect(request.url.replace("http://", "https://", 301))


@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")


# TO UPLOAD THE MP3 FILE and mint it
@app.route("/upload", methods=["GET", "POST"])
def upload():
    print("CALLED UPLOAD")
    if request.method == "POST":
        print(request.form)
        for k,v in request.form.items():
            print(k,v)

        to_address = request.form["buyerAddress2"]
        print(f"\n BUYER ADDRESS: {to_address}\n")
        # if buyer address is not valid, return error
        if not to_address.startswith("0x"):
            flash("Invalid Buyer Address")
            return redirect(url_for("index"))

        print("CALLED UPLOAD POST")
        print("FILES", request.files)
        f = request.files["audio_data"]

        # get all filenames (numbers) in the uploads folder
        files = os.listdir("./uploads")
        # get the highest number in the list and add 1
        highest_number = max(files, key=lambda x: int(x.split(".")[0]))
        highest_number = int(highest_number.split(".")[0]) + 1
        # make new dir and save file
        new_dir = f"uploads/{highest_number}"
        os.mkdir(new_dir)
        f.save(f"{new_dir}/audio.wav")
        # convert to mp3
        sound = AudioSegment.from_wav(f"{new_dir}/audio.wav")
        sound.export(f"{new_dir}/audio.mp3", format="mp3")

        # @DEV:
        # now mint the nft
        # tx_hash, token_id, img_uri, sound_uri = (
        #     "0x8189bab146f405d4025c82da967899f460e2fdf020ba7bf458374158ff834b31",
        #     9,
        #     "ipfs://bafybeif2iboafdpilkyyicxuxbvrdgqf7makwyqqzhoecik2appxem54qa/waveform.png",
        #     "ipfs://bafybeif2iboafdpilkyyicxuxbvrdgqf7makwyqqzhoecik2appxem54qa/audio.mp3",
        # )
        # to_address = "0x6B3751c5b04Aa818EA90115AA06a4D9A36A16f02"

        tx_hash, token_id, img_uri, sound_uri = nft.create_nft(f"{new_dir}/", "audio.mp3", to_address)
        print(tx_hash, token_id, img_uri, sound_uri)
        print("TOKEN ID", token_id)

        # construct response
        response = {
            "tx_hash": tx_hash,
            "token_id": token_id,
            "file_id": highest_number,
            "img_uri": img_uri,
            "sound_uri": sound_uri,
            "opensea_url": f"https://testnets.opensea.io/assets/mumbai/0x0D3492437E86dabb67F2bCfAE5c597D2edA67D65/{token_id}",
            "rarible_url": f"https://testnet.rarible.com/collection/polygon/0x0D3492437E86dabb67F2bCfAE5c597D2edA67D65/{token_id}",
            "ipfs_url": f"https://ipfs.io/ipfs/{img_uri.split('ipfs://')[1]}",
        }
        return jsonify(response)
    else:
        print("CALLED UPLOAD GET")
        print("GET", request.args)
        print("GET", request)
        return "upload"

# display image from uploads folder
@app.route("/i/<dir>/<file>")
def uploaded_file(dir, file):
    return send_file(f"uploads/{dir}/{file}")


if __name__ == "__main__":
    # differentiate between local and production
    if "ENV" in os.environ:
        if os.environ["ENV"] == "PROD":
            app.run(debug=False)
        elif os.environ["ENV"] == "DEV":
            app.run(debug=True)
    else:
        app.run(debug=True)
