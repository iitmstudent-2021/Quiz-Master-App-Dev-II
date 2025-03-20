export default {
  name: "AddQuestion",
  template: `
    <div class="p-3" style="max-width: 600px; margin: auto;">
      <h2 class="text-center text-warning" style="margin-bottom: 1rem; font-weight: bold;">
        {{ isEdit ? "Edit Question" : "New Question" }}
      </h2>

      <div class="card" style="border: 2px solid #ffa500; border-radius: 8px;">
        <div class="card-body" style="background-color: #ffffff;">
          <!-- Quiz ID -->
          <div class="mb-3">
            <label class="form-label fw-bold">Quiz ID:</label>
            <input
              type="number"
              class="form-control"
              v-model="questionData.quiz_id"
              placeholder="e.g. 101"
              :disabled="isEdit"
            />
          </div>

          <!-- Question Title -->
          <div class="mb-3">
            <label class="form-label fw-bold">Question Title:</label>
            <input
              type="text"
              class="form-control"
              v-model="questionData.name"
              placeholder="e.g. Basics of HTML"
            />
          </div>

          <!-- Question Statement -->
          <div class="mb-3">
            <label class="form-label fw-bold">Question Statement:</label>
            <textarea
              class="form-control"
              rows="3"
              v-model="questionData.question_statement"
              placeholder="Describe the question in detail"
            ></textarea>
          </div>

          <!-- Options Section -->
          <div class="border p-3 mb-3">
            <h5 class="fw-bold mb-3">Single Option Correct</h5>

            <div class="mb-2">
              <label class="form-label">Option 1:</label>
              <input
                type="text"
                class="form-control"
                v-model="questionData.option_1"
                placeholder="Option 1 text"
              />
            </div>
            <div class="mb-2">
              <label class="form-label">Option 2:</label>
              <input
                type="text"
                class="form-control"
                v-model="questionData.option_2"
                placeholder="Option 2 text"
              />
            </div>
            <div class="mb-2">
              <label class="form-label">Option 3:</label>
              <input
                type="text"
                class="form-control"
                v-model="questionData.option_3"
                placeholder="Option 3 text"
              />
            </div>
            <div class="mb-2">
              <label class="form-label">Option 4:</label>
              <input
                type="text"
                class="form-control"
                v-model="questionData.option_4"
                placeholder="Option 4 text"
              />
            </div>
            <div class="mb-2">
              <label class="form-label">Correct option (1 to 4):</label>
              <input
                type="number"
                class="form-control"
                v-model.number="questionData.correct_option"
                min="1"
                max="4"
                placeholder="2"
              />
            </div>
          </div>

          <!-- Buttons -->
          <div class="text-end">
            <button class="btn btn-primary me-2" @click="saveQuestion">
              {{ isEdit ? "Update" : "Save & Next" }}
            </button>
            <button class="btn btn-secondary" @click="closePage">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      isEdit: false,
      questionData: {
        quiz_id: "",
        name: "",
        question_statement: "",
        option_1: "",
        option_2: "",
        option_3: "",
        option_4: "",
        correct_option: 1
      }
    }
  },

  mounted() {
    const quizIdParam = this.$route.params.quizId
    const questionIdParam = this.$route.params.questionId

    if (questionIdParam) {
      // We are editing an existing question
      this.isEdit = true
      fetch(`/api/questions/${questionIdParam}`, {
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          // data = { id, quiz_id, name, ... }
          this.questionData = data
        })
        .catch(err => console.error("Error loading question:", err))
    } else {
      // Creating a new question
      if (quizIdParam) {
        this.questionData.quiz_id = parseInt(quizIdParam)
      }
    }
  },

  methods: {
    saveQuestion() {
      // Basic validation
      if (!this.questionData.quiz_id) {
        alert("Quiz ID is required.")
        return
      }
      if (!this.questionData.name.trim()) {
        alert("Question title is required.")
        return
      }
      if (!this.questionData.question_statement.trim()) {
        alert("Question statement is required.")
        return
      }
      if (this.questionData.correct_option < 1 || this.questionData.correct_option > 4) {
        alert("Correct option must be between 1 and 4.")
        return
      }

      if (this.isEdit) {
        // PUT: update existing
        const questionId = this.$route.params.questionId
        fetch(`/api/questions/${questionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify(this.questionData)
        })
          .then(res => res.json())
          .then(data => {
            console.log("Question updated:", data)
            // Return to quiz mgmt or question list
            this.$router.push("/quiz")
          })
          .catch(err => console.error("Error updating question:", err))
      } else {
        // POST: create new
        fetch("/api/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify(this.questionData)
        })
          .then(res => res.json())
          .then(data => {
            console.log("Question created:", data)
            // Optionally reset form to add multiple
            this.resetForm()
          })
          .catch(err => console.error("Error creating question:", err))
      }
    },

    resetForm() {
      const currentQuizId = this.questionData.quiz_id
      this.questionData = {
        quiz_id: currentQuizId,
        name: "",
        question_statement: "",
        option_1: "",
        option_2: "",
        option_3: "",
        option_4: "",
        correct_option: 1
      }
    },

    closePage() {
      this.$router.push("/quiz")
    }
  }
}
