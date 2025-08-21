const appointment_form = `
    <div class="container-fluid text-center">
        <div id="booking-details-row" class="row">
            <div class="col">
                <h3>Booking Details</h3>
                Date: <%= date_locale %> 
                Number of people: <%= asked_capacity %>
                Location: <%= location %>
                Duration: <%= duration %> hours
            </div>
        </div>
        <div id="booking-form-container" class="container">
            <form id="booking-form"  autocomplete="off">
                <input type="hidden" name="datetime_str" value="<%= datetime_str %>">
                <input type="hidden" name="duration_str" value="<%= duration_str %>">
                <input type="hidden" name="available_resource_ids" value="<%= available_resource_ids %>">
                <input type="hidden" name="asked_capacity" value="<%= asked_capacity %>">
                <input type="hidden" name="id" value="<%= id %>">
                <input type="hidden" name="csrf_token" value="<%= csrf_token %>">
                <div class="row mb-4">
                    <div class="col-sm-9">
                        <label class="col-sm-3 col-form-label fw-normal" for="name">Full name*</label>
                        <input type="char" class="form-control" name="name" required="1" placeholder="e.g. John Smith" value="<%= name %>">
                    </div>
                </div>
                <div class="row mb-4">
                    <div class="col-sm-9">
                        <label class="col-sm-3 col-form-label fw-normal" for="email">Email*</label>
                        <input type="email" class="form-control" name="email" required="1" placeholder="e.g. john.smith@example.com" value="<%= email %>">
                    </div>
                </div>
                <div class="row mb-4">
                    <div class="col-sm-9">
                        <label class="col-sm-3 col-form-label fw-normal" for="phone">Phone number*</label>
                        <input type="tel" class="form-control" name="phone" id="phone_field" required="1" placeholder="e.g. +1(605)691-3277" value="<%= phone %>">
                        <small class="form-text">
                            <i class="fa fa-lightbulb-o ms-2 me-1"></i>
                            We will use it to remind you of this appointment.
                        </small>
                    </div>
                </div>
                <div class="my-3 pt-3">
                    <div class="text-end">
                        <button type="submit" id="confirm-booking" class="btn btn-primary">Confirm Appointment</button>
                    </div>
                </div>
            </form>  
        </div>
    </div>`;
export default appointment_form;