const appointment_form = `
<div class="modal-header">
    <div class="conatainer">
        <div class="row">
            <div class="col">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="#">Home</a></li>
                        <li class="breadcrumb-item"><a href="#">Select</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Details</li>
                    </ol>
                </nav>
            </div>
        </div>
    </div>
</div>
<div class="modal-body">
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
                <div class="row mb-4">
                    <label class="col-sm-3 col-form-label fw-normal" for="name">Full name*</label>
                    <div class="col-sm-9">
                        <input type="char" class="form-control" name="name" required="1" placeholder="e.g. John Smith">
                    </div>
                </div>
                <div class="row mb-4">
                    <label class="col-sm-3 col-form-label fw-normal" for="email">Email*</label>
                    <div class="col-sm-9">
                        <input type="email" class="form-control" name="email" required="1" placeholder="e.g. john.smith@example.com">
                    </div>
                </div>
                <div class="row mb-4">
                    <label class="col-sm-3 col-form-label fw-normal" for="phone">Phone number*</label>
                    <div class="col-sm-9">
                        <input type="tel" class="form-control" name="phone" id="phone_field" required="1" placeholder="e.g. +1(605)691-3277">
                        <small class="form-text">
                            <i class="fa fa-lightbulb-o ms-2 me-1"></i>
                            We will use it to remind you of this appointment.
                        </small>
                    </div>
                </div>
                <div class="my-3 pt-3">
                    <div class="o_not_editable text-end">
                        <button type="button" class="btn btn-primary o_appointment_form_confirm_btn">Confirm Appointment</button>
                    </div>
                </div>
            </form>  
        </div>
    </div>
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
</div>`;

export default appointment_form;