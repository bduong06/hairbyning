const available_time_slots = `
    <div class="container-fluid text-center">
        <div class="row">
            <div class="col">
                <ul class="nav nav-tabs" id="available-dates-nav" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" type="button" role="tab">&lt</button>
                    </li>
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
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" type="button" role="tab">&gt</button>
                    </li>
                </ul>
            </div>
        </div>
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
            <div class="card border-custom mb-3">
                <div class="card-body">
                    <div class="row">
                      <% for (const slot of requestedDateSlots){ %>
                        <div class="col">
                            <button type="button" data-available-resources="<%= JSON.stringify(slot['available_resources']) %>" data-url-parameters="<%= slot["url_parameters"] %>"> 
                                <%= slot["start_hour"] %>
                            </button>
                        </div>
                      <% } %>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

export default available_time_slots;