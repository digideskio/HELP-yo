import config from '../../config/config';
import FirebaseAPI from './firebase.api';
import {parseEmailForFirebase} from '../tools/Helpers';
const axios = require('axios');
const headers = {
    'AppKey': config.appKey,
    'Accept': 'application/json'
};

//() => first raw of params = required, others = optional
//TODO: Correct exceptions
export const setStudentProfile = (opts) => {

    const {StudentId, DateOfBirth, fullname, preferredOtherName, Degree, Status, FirstLanguage, CountryOrigin, Gender, CreatorId,
        Background, DegreeDetails, AltContact, Preferred, HSC, HSCMark, IELTS, IELTSMark, TAFE, TAFEMark,
        CULT, CULTMark, InsearchDEEP, InsearchDEEPMark, InsearchDiploma, InsearchDiplomaMark,
        FoundationCourse, FoundationCourseMark} = opts;

    console.log(StudentId, DateOfBirth, fullname, preferredOtherName, Degree, Status, FirstLanguage, CountryOrigin, Gender, CreatorId);

    //TODO: Optimise this so it tells exactly what is wrong (what params is missing)
    if (!StudentId || !DateOfBirth || !Degree || !Status || !FirstLanguage || !CountryOrigin || !CreatorId) {
        throw new Error('Missed out on a required param');
    }

    //NOTE: Setting profile on Firebase
    return new Promise((resolve, reject) => {
        FirebaseAPI.context.auth().onAuthStateChanged(firebaseUser => {
            let studentEmail = firebaseUser.email;
            console.log('INFO: Inserting user into Firebase');
            console.log(opts);
            FirebaseAPI.context.database().ref('/students/' + parseEmailForFirebase(studentEmail)).set(opts, (error) => {
                if(error) {
                    reject(error);
                } else {
                    resolve('Successfully set profile!');
                }
            });
        });
    });
};

export const setStudentFirebaseProfile = (opt) => {


};

export const getStudentFirebaseProfile = (email) => {
    return FirebaseAPI.context.database().ref('/students/'+ parseEmailForFirebase(email));
};

export const getStudent = (opts) => {
    const { studentId } = opts;

    const getParams = {
        headers,
        params: {
            studentId,
        }
    };

    return new Promise((resolve, reject) => {
        axios.get(`${config.baseURL}student`, getParams)
            .then((val) => {
                if (val.data.IsSuccess === 'false') {
                    reject(val.data.DisplayMessage);
                } else {
                    resolve(val);
                }
            });
    });
};


export const registerFirebase = (opts) => {
    const { email, password } = opts;
    return FirebaseAPI.context.auth().createUserWithEmailAndPassword(email, password);
};

export const loginFirebase = (opts) => {
    const { email, password } = opts;
    return FirebaseAPI.context.auth().signInWithEmailAndPassword(email, password);
};

export const logoutFirebase = (opts) => {
    return FirebaseAPI.context.auth().signOut();
};