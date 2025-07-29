const available_time_slots = `
<div class="modal-header">
    <div class="conatainer">
        <div class="row">
            <div class="col">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="#">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Select</li>
                    </ol>
                </nav>
            </div>
        </div>
        <div class="row">
            <div class="col-1">
                <button id="nav-control-prev" data-start-index="<%= startIndex %>" class="nav-link" type="button" role="tab">&lt</button>
            </div>
            <div class="col-9">
                <ul class="nav nav-tabs" id="available-dates-nav" role="tablist">
                    <% availableSlots.forEach((slot, index) => {
                    let active = null;
                    let dnone = " d-none";
                    const slotDate = slot.day;
                    const shortDate = new Date(slotDate); %>
                    <li class="nav-item" role="presentation">
                    <% if(slotDate == date) { active = " active"} %>
                    <% if(index >= startIndex && index <= (startIndex + 6) ) { dnone = null}%>
                        <button class="nav-link<%= active %><%= dnone %>" type="button" role="tab" data-slot-date="<%= slotDate %>" data-available-slots="<%= JSON.stringify(slot.slots) %>">
                            <%= shortDate.toLocaleString('en-US',{month: "short", day: "numeric"}); %>
                        </button>
                    </li>
                    <% }) %>
                </ul>
            </div>
            <div class="col-1">
                <button id="nav-control-next" data-start-index="<%= startIndex %>" class="nav-link" type="button" role="tab">&gt</button>
            </div>
            <div class="col-1">
                <input id="slots-datepicker" class="form-control" name="date" type="text">
            </div>
        </div>
    </div>
</div>
<div class="modal-body">
    <div class="container-fluid text-center">
        <div id="booking-details-row" class="row">
            <div class="col">
                <h3>Booking Details</h3>
                Date: <span id="current-slot-date"><%= date %></span>
                Number of people: <%= asked_capacity %>
                Location: <%= location %>
                Duration: <%= requestedDateSlots[0]["slot_duration"] %>
            </div>
        </div>
        <div id="available-time-slots-container" class="container">
            <form id="time_slots_form"  autocomplete="off">
                <input type="hidden" name="active" value="True">
                <input type="hidden" name="appointment_type_id" value="<%= appointment_type_id %>">
                <input type="hidden" name="schedule_based_on" value="resources">
                <input type="hidden" name="assign_method" value="time_auto_assign">
            </form>  
        <% let row = true;
            let col = 1;
            for (const slot of requestedDateSlots){ %>
            <% if (row){ %>
                <div class="row">
                <% row = false; %>
            <% } %>
                    <div class="col-6">
                        <div class="card border-custom mb-3">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col">
                                        <button type="button" data-available-resources="<%= JSON.stringify(slot['available_resources']) %>" data-url-parameters="<%= slot["url_parameters"] %>"> 
                                            <%= slot["start_hour"] %>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            <% if (col == 2) {
                row = true; 
                col = 0; %>
                </div>
            <% } %>
            <% col++; %>
            <% } %>
        </div>
    </div>
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
</div>`;

export default available_time_slots;