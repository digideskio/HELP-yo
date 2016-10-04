/**
 * Created by Shin on 2/10/2016.
 */
import { computed, observable, autorun } from 'mobx';
import WorkshopBookingModel from '../models/WorkshopBookingModel';
import {getWorkshopBookingFirebaseByWorkshopId, getWorkshopBookingFirebaseByUserId} from '../api/workshopBookings.api';

class WorkshopBookingsStore {
    @observable bookings = [];
    @observable single = null;

    listenToSingleBookingByWorkshopId(workshopID, userId) {
        getWorkshopBookingFirebaseByWorkshopId({workshopId: workshopID, userId: userId}).on('value', (snapshot) => {
            console.log('INFO: got value of workshop bookings by workshop ID')
            if(snapshot.val() !== null){
                var data = snapshot.val();
                this.single = new WorkshopBookingModel(
                    data.workshopId, data.userId
                );
            }
        });
    }

    listenToBookingsByUserId(userId) {
        getWorkshopBookingFirebaseByUserId(userId).on('value', (snapshot) => {
            console.log('INFO: got value of workshop bookings by user ID')
            //Emptying bookings array
            this.bookings = [];

            if(snapshot.val() !== null) {
                var data = snapshot.val().workshopId;
                for(var key in data) {
                    let currentBooking = data[key];
                    console.log('pushing');
                    console.log(currentBooking);
                    this.bookings.push(
                        new WorkshopBookingModel(currentBooking.workshopId, currentBooking.userId)
                    );
                }
            }

        });
    }

    resetSingle() {
        this.single = null;
    }

}

export default new WorkshopBookingsStore;