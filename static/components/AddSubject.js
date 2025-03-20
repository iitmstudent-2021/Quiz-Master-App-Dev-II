export default {
  name: "AddSubject",
  template: `
    <div class="p-3" style="max-width: 600px; margin: auto;">
      <h2 class="text-center text-warning" style="margin-bottom: 1rem; font-weight: bold;">
        New Subject
      </h2>
      
      <div class="card" style="border: 2px solid #ffa500; border-radius: 8px;">
        <div class="card-body" style="background-color: #ffffff;">
          <!-- Subject Name -->
          <div class="mb-3">
            <label class="form-label fw-bold">Subject Name:</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="subjectData.name" 
              placeholder="e.g. Mathematics" 
            />
          </div>
  
          <!-- Subject Description -->
          <div class="mb-3">
            <label class="form-label fw-bold">Description:</label>
            <textarea 
              class="form-control" 
              rows="3" 
              v-model="subjectData.description" 
              placeholder="Enter subject description"
            ></textarea>
          </div>
  
          <p class="text-danger">
            Note: you may include more input fields as needed...
          </p>
  
          <!-- Save/Cancel Buttons -->
          <div class="text-end mt-4">
            <button class="btn btn-primary me-2" @click="createSubject">
              Save
            </button>
            <button class="btn btn-secondary" @click="cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      subjectData: {
        name: "",
        description: ""
      }
    }
  },
  methods: {
    createSubject() {
      if (!this.subjectData.name.trim()) {
        alert("Subject name is required.");
        return;
      }
      fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(this.subjectData)
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Subject created:", data);
          // After saving, navigate to the dashboard or subject list page.
          this.$router.push("/admin");
        })
        .catch((err) => console.error("Error creating subject:", err));
    },
    cancel() {
      this.$router.push("/admin");
    }
  }
};
