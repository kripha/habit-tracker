from flask import Flask
from flask import render_template
from flask import request, jsonify
app = Flask(__name__)

data = {
    "sun": [],
    "mon": [],
    "tues": [],
    "wed": [],
    "thurs": [],
    "fri": [],
    "sat": []
}

@app.route('/')
def testing():
    return render_template('index.html')

@app.route('/add-new-habit', methods=['POST'])
def add_new_habit():
    global data

    json_data = request.get_json()
    weekday = json_data["weekday"]
    habit_name = json_data["habit_name"]

    data[weekday.lower()].append(habit_name)
    print(data)
    return jsonify() # return empty content

@app.route('/add-used-habit', methods=['POST'])
def add_used_habit():
    global data

    json_data = request.get_json()
    habit_name = json_data["habit_name"]
    old_weekday = json_data["old_weekday"]
    new_weekday = json_data["new_weekday"]

    data[old_weekday.lower()].remove(habit_name)
    data[new_weekday.lower()].append(habit_name)
    print(data)
    return jsonify() # return empty content


if __name__ == '__main__':
    app.run(debug=True, port=5001)