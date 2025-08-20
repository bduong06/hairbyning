const requested_date_slots = `           
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
                            <button type="button" data-bs-target="#continue-booking-signin" data-bs-toggle="modal" data-available-resources="<%= JSON.stringify(slot['available_resources']) %>" data-url-parameters="<%= slot["url_parameters"] %>"> 
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
<% } %>`;
export default requested_date_slots; 