/**
 * Created by Shin on 1/10/2016.
 */
import React from 'react';
import { observer } from 'mobx-react';
import WorkshopModel from '../models/WorkshopModel';
import {getFormattedRangeDate} from '../tools/Helpers';
import WorkshopBookingsStore from '../stores/WorkshopBookingsStore';
import StudentStore from '../stores/StudentStore';
import FirebaseAPI from '../api/firebase.api';
import Spinner from '../components/Spinner';
import {createWorkshopBookingFirebase, deleteWorkshopBookingFirebase, setReminderForBooking} from '../api/workshopBookings.api';

@observer
export default class Single extends React.Component {

    rangeDateDelimeter = ' - ';



    constructor() {
        super();
        this.state = {
            workshopId: 0,
            studentId: 0,
            userEmail: '',
            spinnerEnabled: true,
            authorized: false
        }
    }

    componentWillMount() {
        FirebaseAPI.context.auth().onAuthStateChanged((user) => {
            if(user) {
                let workshopId = this.props.workshopId;
                let userEmail = user.email;

                //Bind Mobx listener to single observable
                WorkshopBookingsStore.listenToSingleBookingByWorkshopId(workshopId, userEmail);

                StudentStore.fetchStudent(userEmail);

                //Disable spinner since the component is authorized
                this.setState({
                    spinnerEnabled: false,
                    authorized: true,
                    workshopId: workshopId,
                    userEmail: userEmail
                });
            } else {
                console.log('<Single /> is not authorized!');
            }
        });
    }


    onBookNowClick(e) {
        e.preventDefault();
        if(this.state.authorized) {

            //Required to easily figure out workshop details from bookings data stored on Firebase
            let workshopTopic = this.props.workshopStore.single.topic;
            let workshopDescription = this.props.workshopStore.single.description;
            let workshopStartDate = this.props.workshopStore.single.StartDate;
            let workshopEndDate = this.props.workshopStore.single.EndDate;
            let maxSeats = this.props.workshopStore.single.maximum;
            let BookingCount = this.props.workshopStore.single.BookingCount;
            let campus = this.props.workshopStore.single.campus;

            createWorkshopBookingFirebase({
                workshopId: this.state.workshopId,
                studentId: this.state.studentId,
                userId: this.state.userEmail,
                topic: workshopTopic,
                description: workshopDescription,
                StartDate: workshopStartDate,
                EndDate: workshopEndDate,
                maxSeats,
                BookingCount,
                campus
            });
        } else {
            console.log('You are not authorized to perform Booking action');
        }

    }

    onBookCancelClick(e) {
        e.preventDefault();
        if(this.state.authorized) {
            deleteWorkshopBookingFirebase({
                workshopId: this.state.workshopId,
                userId: this.state.userEmail
            });

            //TODO: Make sure nullifying single into '' no bugs
            WorkshopBookingsStore.single = '';
        } else {
            console.log('You are not authorized to perform Booking action');
        }
    }

    //TODO: Fix reminder feature => Throws 404 error
    //TODO: get these working
    onClickReminder(e) {
        e.preventDefault();
        let reminderMethod = this.reminderMethod.value;
        let reminderTime = this.reminderTime.value;

        console.log(reminderMethod);
        console.log(reminderTime);
        console.log(StudentStore.student);

        switch(reminderMethod) {
            case 'email':
                this.setEmailNotification(reminderTime);
                break;

            case 'sms':

                break;
        }

    }

    setEmailNotification(reminderTime) {
        switch(reminderTime) {
            case '30second':
                break;
            case '2min':
                break;
            case '30min':
                break;
        }

        setReminderForBooking({
            StartDate: '2016-11-09T22:22:10',
            to: this.state.userEmail,
            subject: 'Test email from frontend',
            content: 'test!!'
        });

    }

    //TODO: Fix naming convention spinnerEnabled => workshopSpinnerEnabled   singleInstance => workshopSingleInstance
    render() {
        const singleInstance = this.props.workshopStore.single;
        const {spinnerEnabled} = this.state;
        var singleBooking = WorkshopBookingsStore.single;
        var bookingSpinnerEnabled = true;

        //Find out if workshop booking single has been fetched
        console.log('Workshop booking store single!  ' , WorkshopBookingsStore.single);
        if(singleBooking !== null || singleBooking === '') {
            bookingSpinnerEnabled = false;
        }


        //Rendering Single component STARTS
        let singleComponent = '';
        if(singleInstance instanceof WorkshopModel) {

            let formattedDate = getFormattedRangeDate(singleInstance.StartDate, singleInstance.EndDate, this.rangeDateDelimeter);
            let availables = singleInstance.maximum - singleInstance.BookingCount;
            let bookingButton = '';
            let reminderButton = '';

            //Show cancel booking

            //Todo optimize this to properly wait for response from Firebase


            if(singleBooking !== null && singleBooking !== '') {
                bookingButton = (<button class="button-book-cancel" onClick={this.onBookCancelClick.bind(this)}>cancel booking</button>);
                reminderButton = (
                    <div class="reminder-methods">
                        <div class="form-group-select">
                            <label>choose a reminder method</label>
                            <select ref={(c) => this.reminderMethod = c}>
                                <option value="">--- options ---</option>
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                            </select>
                        </div>

                        <div class="form-group-select">
                            <label>reminder time</label>
                            <select ref={(c) => this.reminderTime = c}>
                                <option value="">--- options ---</option>
                                <option value="30second">30 seconds before</option>
                                <option value="2min">2 minute before</option>
                                <option value="30min">30 minute before</option>
                            </select>
                        </div>
                        <button class="button-reminder" onClick={this.onClickReminder.bind(this)}>Set reminder</button>
                    </div>
                );
            } else {
                bookingButton = (<button class="button-book" onClick={this.onBookNowClick.bind(this)}>book now</button>);

            }

            singleComponent = (

                <div class="single">

                    <Spinner visible={spinnerEnabled} />

                    <div class="single-meta-top">
                        <div class="single-meta-top-left">
                            <div>

                                banner

                            </div>
                        </div>

                        <div class="single-meta-top-right">
                            <div>

                                <header>{singleInstance.topic}</header>
                                <div class="single-ranged-date">{formattedDate}</div>
                                <div class="single-target-group">
                                    <h3>target group</h3>
                                    <div>{singleInstance.targetingGroup}</div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div class="single-controls">
                        <div>
                            <div class="single-controls-right">
                                <Spinner visible={bookingSpinnerEnabled} />
                                <div>
                                    {bookingButton}
                                </div>
                                <div>
                                    {reminderButton}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="single-meta-bottom">

                        <div class="single-meta-bottom-left">
                            <div>

                                <div>
                                    <h3>description</h3>
                                    <div>{singleInstance.description}</div>
                                </div>

                            </div>
                        </div>


                        <div class="single-meta-bottom-right">
                            <div>

                                <div>
                                    <h3>room</h3>
                                    <div>{singleInstance.campus}</div>
                                </div>
                                <div>
                                    <h3>spots available</h3>
                                    <div>{availables}</div>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
            );
        }
        //Rendering Single component ENDS

        return (
            <div class="container-medium">
                {singleComponent}
            </div>
        );
    }

}