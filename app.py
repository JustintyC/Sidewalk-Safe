from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import requests
import base64
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = 'static/uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Set your OpenAI API key here
openai_api_key = ""


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
def index():
    files = [f for f in os.listdir(
        app.config['UPLOAD_FOLDER']) if allowed_file(f)]
    return render_template('index.html', files=files)


@app.route('/upload', methods=['POST'])
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('input_image')
    description = request.form.get('description', '')
    latitude = request.form.get('latitude', '')
    longitude = request.form.get('longitude', '')
    filename = None
    image_analysis = None

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Call the function to analyze the image
        image_analysis = analyze_image_with_gpt4(file_path)
    else:
        # Handle the case where no image is uploaded
        image_analysis = {"error": "No image uploaded"}

    response = jsonify({
        "filename": filename,
        "description": description,
        "latitude": latitude,
        "longitude": longitude,
        "analysis": image_analysis
    })
    response.status_code = 201 if filename else 200
    return response


def analyze_image_with_gpt4(image_path):
    # Function to encode the image in base64
    def encode_image(path):
        with open(path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    base64_image = encode_image(image_path)

    # Form the payload for the API request
    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {"role": "system", "content": "You will analyze the following photo and only respond the word icy, dark, or NONE."},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_api_key}"
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to analyze image"}


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    app.run(debug=True)
