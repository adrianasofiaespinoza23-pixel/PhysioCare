from flask import Flask, jsonify, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow.sqla import SQLAlchemyAutoSchema
from marshmallow import fields
from sqlalchemy import func
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:111@localhost:3306/PhysioCare'
db = SQLAlchemy(app)

    
class Physiotherapist(db.Model):
    __tablename__ = 'physiotherapists'

    therapist_id = db.Column(db.Integer, primary_key=True) 
    first_name = db.Column(db.String(25), nullable=False)
    last_name = db.Column(db.String(20), nullable=False)
    specialization = db.Column(db.String(45), nullable=False)
    phone_number = db.Column(db.String(11), nullable=False)
    email = db.Column(db.String(30), nullable=False)
    hire_date = db.Column(db.Date, nullable=False)
    license_no = db.Column(db.String(20), nullable=False)
    active = db.Column(db.Boolean, nullable=False)

    appointments = db.relationship('Appointment', backref='physiotherapist', lazy=True)
    treatment_plans = db.relationship('Treatment_Plan', backref='physiotherapist', lazy=True)


    def __init__(self, first_name, last_name, specialization,
                 phone_number, email, hire_date, license_no, active):
        self.first_name = first_name
        self.last_name = last_name
        self.specialization = specialization
        self.phone_number = phone_number
        self.email = email
        self.hire_date = hire_date
        self.license_no = license_no
        self.active = active

    def create(self):
        db.session.add(self)
        db.session.commit()
        return self

    def __repr__(self):
        return '<Physiotherapist %d>' %self.therapist_id

 

class Patient(db.Model):
    __tablename__ = 'patients'

    patient_id = db.Column(db.Integer, primary_key=True) 
    first_name = db.Column(db.String(25), nullable=False)
    last_name = db.Column(db.String(20), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(1), nullable=False)
    phone_number = db.Column(db.String(11), nullable=False)
    email = db.Column(db.String(30), nullable=False)
    address = db.Column(db.String(40), nullable=False)

    appointments = db.relationship('Appointment', backref='patient', lazy=True)
    treatment_plans = db.relationship('Treatment_Plan', backref='patient', lazy=True)

    def __init__(self, first_name, last_name, birth_date,
                 gender, phone_number, email, address):
        self.first_name = first_name
        self.last_name = last_name
        self.birth_date = birth_date
        self.gender = gender
        self.phone_number = phone_number
        self.email = email
        self.address = address

    def create(self):
        db.session.add(self)
        db.session.commit()
        return self

    def __repr__(self):
        return '<Patient %d>' %self.patient_id


class Treatment_Plan(db.Model):
    __tablename__ = 'treatment_plans'

    plan_id = db.Column(db.Integer, primary_key=True) 
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id'), nullable=False)
    therapist_id = db.Column(db.Integer, db.ForeignKey('physiotherapists.therapist_id'), nullable=False)
    diagnosis = db.Column(db.String(255), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    frequency = db.Column(db.String(30), nullable=False)
    plan_status = db.Column(db.String(20), nullable=False)

    appointments = db.relationship('Appointment', backref='treatment_plan', lazy=True)

    def __init__(self, patient_id, therapist_id, diagnosis,
                 start_date, end_date, frequency, plan_status):
        self.patient_id = patient_id
        self.therapist_id = therapist_id
        self.diagnosis = diagnosis
        self.start_date = start_date
        self.end_date = end_date
        self.frequency = frequency
        self.plan_status = plan_status

    def create(self):
        db.session.add(self)
        db.session.commit()
        return self

    def __repr__(self):
        return '<Treatment_Plan %d>' %self.plan_id


class Appointment(db.Model):
    __tablename__ = 'appointments'

    appointment_id = db.Column(db.Integer, primary_key=True) 
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.patient_id'), nullable=False)
    therapist_id = db.Column(db.Integer, db.ForeignKey('physiotherapists.therapist_id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('treatment_plans.plan_id'), nullable=True)
    app_date = db.Column(db.Date, nullable=False)
    app_time = db.Column(db.Time, nullable=False)
    app_status = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.String(255), nullable=False)

    therapy_sessions = db.relationship('Therapy_Session', backref='appointment', lazy=True, uselist=False)
    billing = db.relationship('Billing', backref='appointment', lazy=True)

    def __init__(self, patient_id, therapist_id, plan_id,
                 app_date, app_time, app_status, notes):
        self.patient_id = patient_id
        self.therapist_id = therapist_id
        self.plan_id = plan_id
        self.app_date = app_date
        self.app_time = app_time
        self.app_status = app_status
        self.notes = notes

    def create(self):
        db.session.add(self)
        db.session.commit()
        return self

    def __repr__(self):
        return '<Appointment %d>' %self.appointment_id


class Therapy_Session(db.Model):
    __tablename__ = 'therapy_sessions'

    session_id = db.Column(db.Integer, primary_key=True) 
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.appointment_id'), nullable=False)
    session_date = db.Column(db.Date, nullable=False)
    techniques = db.Column(db.String(255), nullable=False)
    pain_level = db.Column(db.SmallInteger, nullable=False)
    progress_notes = db.Column(db.String(255), nullable=False)

    def __init__(self, appointment_id, session_date,
                 techniques, pain_level, progress_notes):
        self.appointment_id = appointment_id
        self.session_date = session_date
        self.techniques = techniques
        self.pain_level = pain_level
        self.progress_notes = progress_notes

    def create(self):
        db.session.add(self)
        db.session.commit()
        return self

    def __repr__(self):
        return '<Therapy_Session %d>' %self. session_id


class Billing(db.Model):
    __tablename__ = 'billings'

    billing_id = db.Column(db.Integer, primary_key=True) 
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.appointment_id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_date = db.Column(db.Date, nullable=False)
    method = db.Column(db.String(20), nullable=False)
    payment_status = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.String(255), nullable=False)

    def __init__(self, appointment_id, amount, payment_date,
                 method, payment_status, notes):
        self.appointment_id = appointment_id
        self.amount = amount
        self.payment_date = payment_date
        self.method = method
        self.payment_status = payment_status
        self.notes = notes

    def create(self):
        db.session.add(self)
        db.session.commit()
        return self

    def __repr__(self):
        return '<Billing %d>' %self.billing_id



class PhysiotherapistSchema(SQLAlchemyAutoSchema):
    class Meta(SQLAlchemyAutoSchema.Meta):
        model = Physiotherapist
        sqla_session = db.session

    therapist_id = fields.Integer(dump_only=True)
    first_name = fields.String(required=True)
    last_name = fields.String(required=True)
    specialization = fields.String(required=True)
    phone_number = fields.String(required=True)
    email = fields.String(required=True)
    hire_date = fields.Date(required=True)
    license_no = fields.String(required=True)
    active = fields.Boolean(required=True)


class PatientSchema(SQLAlchemyAutoSchema):
    class Meta(SQLAlchemyAutoSchema.Meta):
        model = Patient
        sqla_session = db.session

    patient_id = fields.Integer(dump_only=True)
    first_name = fields.String(required=True)
    last_name = fields.String(required=True)
    birth_date = fields.Date(required=True)
    gender = fields.String(required=True)
    phone_number = fields.String(required=True)
    email = fields.String(required=True)
    address = fields.String(required=True)


class TreatmentPlanSchema(SQLAlchemyAutoSchema):
    class Meta(SQLAlchemyAutoSchema.Meta):
        model = Treatment_Plan
        sqla_session = db.session

    plan_id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    therapist_id = fields.Integer(required=True)
    diagnosis = fields.String(required=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)
    frequency = fields.String(required=True)
    plan_status = fields.String(required=True)


class AppointmentSchema(SQLAlchemyAutoSchema):
    class Meta(SQLAlchemyAutoSchema.Meta):
        model = Appointment
        sqla_session = db.session

    appointment_id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    therapist_id = fields.Integer(required=True)
    plan_id = fields.Integer(load_default=None)
    app_date = fields.Date(required=True)
    app_time = fields.Time(required=True)
    app_status = fields.String(required=True)
    notes = fields.String(required=True)


class TherapySessionSchema(SQLAlchemyAutoSchema):
    class Meta(SQLAlchemyAutoSchema.Meta):
        model = Therapy_Session
        sqla_session = db.session

    session_id = fields.Integer(dump_only=True)
    appointment_id = fields.Integer(required=True)
    session_date = fields.Date(required=True)
    techniques = fields.String(required=True)
    pain_level = fields.Integer(required=True)
    progress_notes = fields.String(required=True)


class BillingSchema(SQLAlchemyAutoSchema):
    class Meta(SQLAlchemyAutoSchema.Meta):
        model = Billing
        sqla_session = db.session

    billing_id = fields.Integer(dump_only=True)
    appointment_id = fields.Integer(required=True)
    amount = fields.Decimal(required=True, as_string=True)
    payment_date = fields.Date(required=True)
    method = fields.String(required=True)
    payment_status = fields.String(required=True)
    notes = fields.String(required=True)


with app.app_context():
    db.create_all()



# curl -v http://127.0.0.1:5000/physiotherapists
@app.route('/physiotherapists', methods=['GET'])
def physiotherapists():
    get_physiotherapists = Physiotherapist.query.all()
    physiotherapists_schema = PhysiotherapistSchema(many=True)
    physiotherapists = physiotherapists_schema.dump(get_physiotherapists)
    return make_response(jsonify({"physiotherapists": physiotherapists}))

# curl -v http://127.0.0.1:5000/patients
@app.route('/patients', methods=['GET'])
def patients():
    get_patients = Patient.query.all()
    patients_schema = PatientSchema(many=True)
    patients = patients_schema.dump(get_patients)
    return make_response(jsonify({"patients": patients}))

# curl -v http://127.0.0.1:5000/treatment_plans
@app.route('/treatment_plans', methods=['GET'])
def treatment_plans():
    get_treatment_plans = Treatment_Plan.query.all()
    treatment_plans_schema = TreatmentPlanSchema(many=True)
    treatment_plans = treatment_plans_schema.dump(get_treatment_plans)
    return make_response(jsonify({"treatment_plans": treatment_plans}))

# curl -v http://127.0.0.1:5000/appointments
@app.route('/appointments', methods=['GET'])
def appointments():
    get_appointments = Appointment.query.all()
    appointments_schema = AppointmentSchema(many=True)
    appointments = appointments_schema.dump(get_appointments)
    return make_response(jsonify({"appointments": appointments}))

# curl -v http://127.0.0.1:5000/therapy_sessions
@app.route('/therapy_sessions', methods=['GET'])
def therapy_sessions():
    get_therapy_sessions = Therapy_Session.query.all()
    therapy_sessions_schema = TherapySessionSchema(many=True)
    therapy_sessions = therapy_sessions_schema.dump(get_therapy_sessions)
    return make_response(jsonify({"therapy_sessions": therapy_sessions}))

# curl -v http://127.0.0.1:5000/billings
@app.route('/billings', methods=['GET'])
def billings():
    get_billings = Billing.query.all()
    billings_schema = BillingSchema(many=True)
    billings = billings_schema.dump(get_billings)
    return make_response(jsonify({"billings": billings}))



#curl -v http://127.0.0.1:5000/reports/appointments_by_therapist
@app.route('/reports/appointments_by_therapist', methods=['GET'])
def appointments_by_therapist():
    results = db.session.query(
        Physiotherapist.therapist_id,
        Physiotherapist.first_name,
        Physiotherapist.last_name,
        func.count(Appointment.appointment_id).label('total_appointments')
    ).join(Appointment, Physiotherapist.therapist_id == Appointment.therapist_id)\
     .group_by(Physiotherapist.therapist_id).all()

    report = []

    for row in results:
        report.append({
            "therapist_id": row.therapist_id,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "total_appointments": row.total_appointments
        })

    return make_response(jsonify({"appointments_by_therapist": report}))


""" curl -X POST http://127.0.0.1:5000/patient \
-H "Content-Type: application/json" \
-d '{
        "first_name" : "Fatima",
        "last_name" : "Espinoza",
        "birth_date": "2002-04-14",
        "gender": "F",
        "phone_number": "0963538478",
        "email" : "fatima.espinoza@gmail.com",
        "address" : "Valparaiso"
	}'
"""
@app.route('/patient', methods=['POST'])
def create_patient():

    patients_data = request.get_json()

    try:
        new_patient_data = PatientSchema().load(patients_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    new_patient = Patient(**new_patient_data)

    try:
        db.session.add(new_patient)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    patient_schema = PatientSchema()
    patient_json = patient_schema.dump(new_patient)

    return jsonify(patient_json), 201


""" curl -X PUT http://127.0.0.1:5000/patient/3  \
-H "Content-Type: application/json" \
-d '{
        "first_name" : "Adriana",
        "last_name" : "Espinoza",
        "birth_date": "2002-04-14",
        "gender": "F",
        "phone_number": "0963538478",
        "email" : "fatima.espinoza@gmail.com",
        "address" : "Valparaiso y Antofagasta"
	}'
"""
@app.route('/patient/<int:id>', methods=['PUT'])
def update_patient(id):
    patient = Patient.query.get(id)

    if patient:
        data = request.get_json()

        patient.first_name = data.get('first_name', patient.first_name)
        patient.last_name = data.get('last_name', patient.last_name)
        patient.birth_date = data.get('birth_date', patient.birth_date)
        patient.gender = data.get('gender', patient.gender)
        patient.phone_number = data.get('phone_number', patient.phone_number)
        patient.email = data.get('email', patient.email)
        patient.address = data.get('address', patient.address)

        db.session.commit()

        return jsonify({'message': 'Patient updated successfully'})

    else:
        return jsonify({'message': 'Patient not found'}), 404


#curl --request DELETE -v http://127.0.0.1:5000/patient/2 
@app.route('/patient/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        appointments = Appointment.query.filter_by(patient_id=patient_id).all()
        appointment_ids = [a.appointment_id for a in appointments]

        if appointment_ids:
            Billing.query.filter(
                Billing.appointment_id.in_(appointment_ids)
            ).delete(synchronize_session=False)

            Therapy_Session.query.filter(
                Therapy_Session.appointment_id.in_(appointment_ids)
            ).delete(synchronize_session=False)

        Appointment.query.filter_by(patient_id=patient_id).delete()

        Treatment_Plan.query.filter_by(patient_id=patient_id).delete()

        db.session.delete(patient)
        db.session.commit()

        return jsonify({"message": f"Patient {patient_id} deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

""" curl -X POST http://127.0.0.1:5000/physiotherapist \
-H "Content-Type: application/json" \
-d '{
        "first_name" : "Fausto",
        "last_name" : "Chicaiza",
        "specialization": "Sports",
        "phone_number": "0963538478",
        "email" : "fatima.espinoza@gmail.com",
        "hire_date" : "2002-04-14",
        "license_no" : "LIC12286",
        "active" : TRUE

	}'
"""
@app.route('/physiotherapist', methods=['POST'])
def create_physiotherapist():

    physiotherapists_data = request.get_json()

    try:
        new_physiotherapist_data = PhysiotherapistSchema().load(physiotherapists_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    new_physiotherapist = Physiotherapist(**new_physiotherapist_data)

    try:
        db.session.add(new_physiotherapist)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    physiotherapist_schema = PhysiotherapistSchema()
    physiotherapist_json = physiotherapist_schema.dump(new_physiotherapist)

    return jsonify(physiotherapist_json), 201


""" curl -X PUT http://127.0.0.1:5000/physiotherapist/2 \
-H "Content-Type: application/json" \
-d '{
        "first_name" : "Fausto",
        "last_name" : "Chicaiza",
        "specialization": "Sports",
        "phone_number": "0963538478",
        "email" : "fatima.espinoza@gmail.com",
        "hire_date" : "2002-04-14",
        "license_no" : "LIC12286",
        "active" : TRUE

	}'
"""
@app.route('/physiotherapist/<int:id>', methods=['PUT'])
def update_physiotherapist(id):
    physiotherapist = Physiotherapist.query.get(id)

    if physiotherapist:
        data = request.get_json()

        physiotherapist.first_name = data.get('first_name', physiotherapist.first_name)
        physiotherapist.last_name = data.get('last_name', physiotherapist.last_name)
        physiotherapist.specialization = data.get('specialization', physiotherapist.specialization)
        physiotherapist.phone_number = data.get('phone_number', physiotherapist.phone_number)
        physiotherapist.email = data.get('email', physiotherapist.email)
        physiotherapist.hire_date = data.get('hire_date', physiotherapist.hire_date)
        physiotherapist.license_no = data.get('license_no', physiotherapist.license_no)
        physiotherapist.active = data.get('active', physiotherapist.active)

        db.session.commit()

        return jsonify({'message': 'Physiotherapist updated successfully'})

    else:
        return jsonify({'message': 'Physiotherapist not found'}), 404


#curl --request DELETE -v http://127.0.0.1:5000/physiotherapist/2 
@app.route('/physiotherapist/<int:physiotherapist_id>', methods=['DELETE'])
def delete_physiotherapist(physiotherapist_id):
    try:
        physiotherapist = Physiotherapist.query.get(physiotherapist_id)
        if not physiotherapist:
            return jsonify({"error": "Physiotherapist not found"}), 404

        appointments = Appointment.query.filter_by(therapist_id=physiotherapist_id).all()
        appointment_ids = [a.appointment_id for a in appointments]

        if appointment_ids:
            Billing.query.filter(
                Billing.appointment_id.in_(appointment_ids)
            ).delete(synchronize_session=False)

            Therapy_Session.query.filter(
                Therapy_Session.appointment_id.in_(appointment_ids)
            ).delete(synchronize_session=False)

        Appointment.query.filter_by(therapist_id=physiotherapist_id).delete()

        Treatment_Plan.query.filter_by(therapist_id=physiotherapist_id).delete()

        db.session.delete(physiotherapist)
        db.session.commit()

        return jsonify({"message": f"Physiotherapist {physiotherapist_id} deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

""" curl -X POST http://127.0.0.1:5000/treatment_plans \
-H "Content-Type: application/json" \
-d '{
    "patient_id": 1,
    "therapist_id": 3,
    "diagnosis": "Lower back pain",
    "start_date": "2026-01-14",
    "end_date": "2026-02-14",
    "frequency": "2 times/week",
    "plan_status": "Active"
}'
"""
@app.route('/treatment_plans', methods=['POST'])
def create_treatment_plan():

    treatment_plans_data = request.get_json()

    try:
        new_treatment_plans_data = TreatmentPlanSchema().load(treatment_plans_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    new_treatment_plans = Treatment_Plan(**new_treatment_plans_data)

    try:
        db.session.add(new_treatment_plans)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    treatment_plans_schema = TreatmentPlanSchema()
    treatment_plans_json = treatment_plans_schema.dump(new_treatment_plans)

    return jsonify(treatment_plans_json), 201


""" curl -X PUT http://127.0.0.1:5000/treatment_plans/2 \
-H "Content-Type: application/json" \
-d '{
    "patient_id": 1,
    "therapist_id": 2,
    "diagnosis": "Updated diagnosis",
    "start_date": "2026-01-14",
    "end_date": "2026-03-14",
    "frequency": "3 times/week",
    "plan_status": "Completed"
}'
"""
@app.route('/treatment_plans/<int:id>', methods=['PUT'])
def update_treatment_plan(id):

    treatment_plan = Treatment_Plan.query.get(id)

    if treatment_plan:

        data = request.get_json()

        treatment_plan.patient_id = data.get('patient_id', treatment_plan.patient_id)
        treatment_plan.therapist_id = data.get('therapist_id', treatment_plan.therapist_id)
        treatment_plan.diagnosis = data.get('diagnosis', treatment_plan.diagnosis)
        treatment_plan.start_date = data.get('start_date', treatment_plan.start_date)
        treatment_plan.end_date = data.get('end_date', treatment_plan.end_date)
        treatment_plan.frequency = data.get('frequency', treatment_plan.frequency)
        treatment_plan.plan_status = data.get('plan_status', treatment_plan.plan_status)

        db.session.commit()

        return jsonify({'message': 'Treatment plan updated successfully'})

    else:
        return jsonify({'message': 'Treatment plan not found'}), 404
    
# curl --request DELETE -v http://127.0.0.1:5000/treatment_plans/1
@app.route('/treatment_plans/<int:plan_id>', methods=['DELETE'])
def delete_treatment_plan(plan_id):

    try:

        treatment_plan = Treatment_Plan.query.get(plan_id)

        if not treatment_plan:
            return jsonify({"error": "Treatment plan not found"}), 404

        Appointment.query.filter_by(plan_id=plan_id).update(
            {"plan_id": None}
        )

        db.session.delete(treatment_plan)
        db.session.commit()

        return jsonify({
            "message": f"Treatment plan {plan_id} deleted successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500
    

""" curl -X POST http://127.0.0.1:5000/appointment \
-H "Content-Type: application/json" \
-d '{
    "patient_id": 4,
    "therapist_id": 3,
    "plan_id": 4,
    "app_date": "2026-05-01",
    "app_time": "10:30:00",
    "app_status": "Scheduled",
    "notes": "Initial evaluation"
}'
"""
@app.route('/appointment', methods=['POST'])
def create_appointment():

    appointment_data = request.get_json()

    try:
        new_appointment_data = AppointmentSchema().load(appointment_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    new_appointment = Appointment(**new_appointment_data)

    try:

        db.session.add(new_appointment)
        db.session.commit()

    except Exception as e:

        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    appointment_schema = AppointmentSchema()

    return jsonify(
        appointment_schema.dump(new_appointment)
    ), 201


"""
curl -X PUT http://127.0.0.1:5000/appointment/5 \
-H "Content-Type: application/json" \
-d '{
    "patient_id": 1,
    "therapist_id": 1,
    "plan_id": 4,
    "app_date": "2026-05-11",
    "app_time": "11:00:00",
    "app_status": "Completed",
    "notes": "Patient improved"
}'
"""
@app.route('/appointment/<int:id>', methods=['PUT'])
def update_appointment(id):

    appointment = Appointment.query.get(id)

    if appointment:

        data = request.get_json()

        appointment.patient_id = data.get('patient_id', appointment.patient_id)
        appointment.therapist_id = data.get('therapist_id', appointment.therapist_id)
        appointment.plan_id = data.get('plan_id', appointment.plan_id)
        appointment.app_date = data.get('app_date', appointment.app_date)
        appointment.app_time = data.get('app_time', appointment.app_time)
        appointment.app_status = data.get('app_status', appointment.app_status)
        appointment.notes = data.get('notes', appointment.notes)

        db.session.commit()

        return jsonify({
            'message': 'Appointment updated successfully'
        })

    else:
        return jsonify({
            'message': 'Appointment not found'
        }), 404
    

# curl --request DELETE -v http://127.0.0.1:5000/appointment/1
@app.route('/appointment/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):

    try:

        appointment = Appointment.query.get(appointment_id)

        if not appointment:
            return jsonify({
                "error": "Appointment not found"
            }), 404

        Billing.query.filter_by(
            appointment_id=appointment_id
        ).delete()

        Therapy_Session.query.filter_by(
            appointment_id=appointment_id
        ).delete()

        db.session.delete(appointment)

        db.session.commit()

        return jsonify({
            "message": f"Appointment {appointment_id} deleted successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500
    

"""
curl -X POST http://127.0.0.1:5000/therapy_session \
-H "Content-Type: application/json" \
-d '{
    "appointment_id": 5,
    "session_date": "2026-05-10",
    "techniques": "Massage therapy and stretching",
    "pain_level": 4,
    "progress_notes": "Patient shows improvement"
}'
"""
@app.route('/therapy_session', methods=['POST'])
def create_therapy_session():

    session_data = request.get_json()

    try:
        new_session_data = TherapySessionSchema().load(session_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    new_session = Therapy_Session(**new_session_data)

    try:

        db.session.add(new_session)
        db.session.commit()

    except Exception as e:

        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    session_schema = TherapySessionSchema()

    return jsonify(
        session_schema.dump(new_session)
    ), 201


"""
curl -X PUT http://127.0.0.1:5000/therapy_session/3 \
-H "Content-Type: application/json" \
-d '{
    "appointment_id": 5,
    "session_date": "2026-05-11",
    "techniques": "Strength exercises",
    "pain_level": 2,
    "progress_notes": "Pain reduced significantly"
}'

"""
@app.route('/therapy_session/<int:id>', methods=['PUT'])
def update_therapy_session(id):

    session = Therapy_Session.query.get(id)

    if session:

        data = request.get_json()

        session.appointment_id = data.get('appointment_id', session.appointment_id)
        session.session_date = data.get('session_date', session.session_date)
        session.techniques = data.get('techniques', session.techniques)
        session.pain_level = data.get('pain_level', session.pain_level)
        session.progress_notes = data.get('progress_notes', session.progress_notes)

        db.session.commit()

        return jsonify({
            'message': 'Therapy session updated successfully'
        })

    else:
        return jsonify({
            'message': 'Therapy session not found'
        }), 404
    

# curl --request DELETE -v http://127.0.0.1:5000/therapy_session/1
@app.route('/therapy_session/<int:session_id>', methods=['DELETE'])
def delete_therapy_session(session_id):

    try:

        session = Therapy_Session.query.get(session_id)

        if not session:
            return jsonify({
                "error": "Therapy session not found"
            }), 404

        db.session.delete(session)

        db.session.commit()

        return jsonify({
            "message": f"Therapy session {session_id} deleted successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500
    

"""
curl -X POST http://127.0.0.1:5000/billing \
-H "Content-Type: application/json" \
-d '{
    "appointment_id": 6,
    "amount": "25.00",
    "payment_date": "2026-05-02",
    "method": "Cash",
    "payment_status": "Paid",
    "notes": "Payment completed successfully"
}'
"""
@app.route('/billing', methods=['POST'])
def create_billing():

    billing_data = request.get_json()

    try:
        new_billing_data = BillingSchema().load(billing_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    new_billing = Billing(**new_billing_data)

    try:

        db.session.add(new_billing)
        db.session.commit()

    except Exception as e:

        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    billing_schema = BillingSchema()

    return jsonify(
        billing_schema.dump(new_billing)
    ), 201


"""
curl -X PUT http://127.0.0.1:5000/billing/3 \
-H "Content-Type: application/json" \
-d '{
    "appointment_id": 5,
    "amount": "90.00",
    "payment_date": "2026-05-11",
    "method": "Card",
    "payment_status": "Pending",
    "notes": "Waiting for confirmation"
}'
"""
@app.route('/billing/<int:id>', methods=['PUT'])
def update_billing(id):

    billing = Billing.query.get(id)

    if billing:

        data = request.get_json()

        billing.appointment_id = data.get('appointment_id', billing.appointment_id)
        billing.amount = data.get('amount', billing.amount)
        billing.payment_date = data.get('payment_date', billing.payment_date)
        billing.method = data.get('method', billing.method)
        billing.payment_status = data.get('payment_status', billing.payment_status)
        billing.notes = data.get('notes', billing.notes)

        db.session.commit()

        return jsonify({
            'message': 'Billing updated successfully'
        })

    else:
        return jsonify({
            'message': 'Billing not found'
        }), 404
    

# curl --request DELETE -v http://127.0.0.1:5000/billing/1
@app.route('/billing/<int:billing_id>', methods=['DELETE'])
def delete_billing(billing_id):

    try:

        billing = Billing.query.get(billing_id)

        if not billing:
            return jsonify({
                "error": "Billing not found"
            }), 404

        db.session.delete(billing)

        db.session.commit()

        return jsonify({
            "message": f"Billing {billing_id} deleted successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500
    

# curl -v http://127.0.0.1:5000/reports/appointments
@app.route('/reports/appointments', methods=['GET'])
def appointments_report():

    appointments = Appointment.query.all()

    report = []

    for appointment in appointments:
        report.append({
            'appointment_id': appointment.appointment_id,
            'patient_id': appointment.patient_id,
            'therapist_id': appointment.therapist_id,
            'app_date': appointment.app_date,
            'app_status': appointment.app_status
        })

    return jsonify({"appointments_report": report})

# http://127.0.0.1:5000/appointments/patient/1
@app.route('/appointments/patient/<int:patient_id>', methods=['GET'])
def get_appointments_by_patient(patient_id):

    try:

        appointments = Appointment.query.filter_by(
            patient_id=patient_id
        ).all()

        appointments_schema = AppointmentSchema(many=True)

        return jsonify({
            "appointments": appointments_schema.dump(appointments)
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# GET TREATMENT PLANS BY PATIENT
# http://127.0.0.1:5000/treatment_plans/patient/1
# =========================================================
@app.route('/treatment_plans/patient/<int:patient_id>', methods=['GET'])
def get_treatment_plans_by_patient(patient_id):

    try:

        treatment_plans = Treatment_Plan.query.filter_by(
            patient_id=patient_id
        ).all()

        treatment_plans_schema = TreatmentPlanSchema(many=True)

        return jsonify({
            "treatment_plans": treatment_plans_schema.dump(treatment_plans)
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500



# http://127.0.0.1:5000/medical_history/patient/1

@app.route('/medical_history/patient/<int:patient_id>', methods=['GET'])
def get_medical_history_by_patient(patient_id):

    try:

        appointments = Appointment.query.filter_by(
            patient_id=patient_id
        ).all()

        medical_history = []

        for appointment in appointments:

            therapy_session = Therapy_Session.query.filter_by(
                appointment_id=appointment.appointment_id
            ).first()

            therapist = Physiotherapist.query.get(
                appointment.therapist_id
            )

            medical_history.append({

                "appointment_id": appointment.appointment_id,

                "date": appointment.app_date,

                "visit": appointment.app_status,

                "doctor": (
                    f"Dr. {therapist.first_name} {therapist.last_name}"
                    if therapist else "Unknown"
                ),

                "diagnosis": (
                    therapy_session.progress_notes
                    if therapy_session else "No diagnosis"
                ),

                "treatment": (
                    therapy_session.techniques
                    if therapy_session else "No treatment"
                ),

                "notes": appointment.notes
            })

        return jsonify({
            "medical_history": medical_history
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500



# http://127.0.0.1:5000/medications/patient/1
@app.route('/medications/patient/<int:patient_id>', methods=['GET'])
def get_medications_by_patient(patient_id):

    try:

        """
        Your database currently DOES NOT have a medications table.

        So this endpoint returns an empty array
        until you create a medications table.
        """

        medications = []

        return jsonify({
            "medications": medications
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# GET BILLINGS BY PATIENT
# http://127.0.0.1:5000/billings/patient/1
@app.route('/billings/patient/<int:patient_id>', methods=['GET'])
def get_billings_by_patient(patient_id):

    try:

        appointments = Appointment.query.filter_by(
            patient_id=patient_id
        ).all()

        appointment_ids = [
            appointment.appointment_id
            for appointment in appointments
        ]

        if not appointment_ids:

            return jsonify({
                "billings": []
            }), 200

        billings = Billing.query.filter(
            Billing.appointment_id.in_(appointment_ids)
        ).all()

        billing_schema = BillingSchema(many=True)

        return jsonify({
            "billings": billing_schema.dump(billings)
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
