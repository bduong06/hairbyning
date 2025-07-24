const requested_date_slots = `           
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
    </div>`;

export default requested_date_slots; 