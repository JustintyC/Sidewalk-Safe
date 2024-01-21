from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = 'static/uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
def index():
    # List all files in the upload folder to display as pins
    files = [f for f in os.listdir(
        app.config['UPLOAD_FOLDER']) if allowed_file(f)]
    return render_template('index.html', files=files)


@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('input_image')
    description = request.form['description']
    latitude = request.form['latitude']
    longitude = request.form['longitude']
    filename = None

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

    response = jsonify({
        "filename": filename,
        "description": description,
        "latitude": latitude,
        "longitude": longitude
    })
    response.status_code = 201 if filename else 200
    return response


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    app.run(debug=True)
