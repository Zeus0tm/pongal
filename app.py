# Backend: Flask API (app.py)
# Install: pip install flask flask-cors akinator.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from akinator import Akinator
from akinator.exceptions import CantGoBackAnyFurther, InvalidChoiceError
import uuid

app = Flask(__name__)
CORS(app)

# Store game sessions in memory (use Redis/database in production)
sessions = {}

@app.route('/api/start', methods=['POST'])
def start_game():
    data = request.json
    name = data.get('name')
    phone = data.get('phone')
    institution = data.get('institution')
    language = data.get('language', 'en')
    theme = data.get('theme', 'c')
    
    # Create new Akinator client
    session_id = str(uuid.uuid4())
    client = Akinator()
    
    try:
        client.start_game()
        
        sessions[session_id] = {
            'client': client,
            'user_info': {
                'name': name,
                'phone': phone,
                'institution': institution
            }
        }
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'question': client.question,
            'step': client.step,
            'progression': client.progression,
            'akitude_url': client.akitude_url
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/answer', methods=['POST'])
def submit_answer():
    data = request.json
    session_id = data.get('session_id')
    answer = data.get('answer')
    
    if session_id not in sessions:
        return jsonify({'success': False, 'error': 'Invalid session'}), 400
    
    client = sessions[session_id]['client']
    
    try:
        client.answer(answer)
        
        response = {
            'success': True,
            'question': str(client),
            'step': client.step,
            'progression': client.progression,
            'finished': client.finished,
            'win': client.win,
            'akitude_url': client.akitude_url
        }
        
        # If Akinator made a guess
        if client.win and not client.finished:
            response['guess'] = {
                'name': client.name_proposition,
                'description': client.description_proposition,
                'photo': client.photo,
                'pseudo': client.pseudo
            }
        
        # If game is finished
        if client.finished:
            response['final_message'] = client.question
            if client.photo:
                response['photo'] = client.photo
                response['name'] = client.name_proposition
                response['description'] = client.description_proposition
        
        return jsonify(response)
    except InvalidChoiceError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/back', methods=['POST'])
def go_back():
    data = request.json
    session_id = data.get('session_id')
    
    if session_id not in sessions:
        return jsonify({'success': False, 'error': 'Invalid session'}), 400
    
    client = sessions[session_id]['client']
    
    try:
        client.back()
        return jsonify({
            'success': True,
            'question': client.question,
            'step': client.step,
            'progression': client.progression,
            'akitude_url': client.akitude_url
        })
    except CantGoBackAnyFurther:
        return jsonify({'success': False, 'error': "You can't go back any further!"}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/end', methods=['POST'])
def end_session():
    data = request.json
    session_id = data.get('session_id')
    
    if session_id in sessions:
        del sessions[session_id]
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)