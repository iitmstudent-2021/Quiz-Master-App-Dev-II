export default {
  name: "AddQuiz",
  template: `
    <div class="p-3" style="max-width: 600px; margin: auto;">
      <h2 class="text-center text-warning" style="margin-bottom: 1rem; font-weight: bold;">
        New Quiz
      </h2>
      <div class="card" style="border: 2px solid #ffa500; border-radius: 8px;">
        <div class="card-body" style="background-color: #ffffff;">
          <!-- Quiz Name -->
          <div class="mb-3">
            <label class="form-label fw-bold">Quiz Name:</label>
            <input
              type="text"
              class="form-control"
              v-model="quizData.name"
              placeholder="e.g. HTML Basics Quiz"
            />
          </div>
          <!-- Chapter Selection -->
          <div class="mb-3">
            <label class="form-label fw-bold">Chapter:</label>
            <select class="form-select" v-model="quizData.chapter_id">
              <option value="">Select Chapter</option>
              <option v-for="chap in chapters" :key="chap.id" :value="chap.id">
                {{ chap.name }}
              </option>
            </select>
          </div>
          <!-- Quiz Date -->
          <div class="mb-3">
            <label class="form-label fw-bold">Quiz Date (YYYY-MM-DD HH:MM:SS):</label>
            <input
              type="text"
              class="form-control"
              v-model="quizData.quiz_date"
              placeholder="e.g. 2025-04-15 10:00:00"
            />
          </div>
          <!-- Duration in minutes -->
          <div class="mb-3">
            <label class="form-label fw-bold">Duration (in minutes):</label>
            <input
              type="number"
              class="form-control"
              v-model="quizData.duration_time"
              placeholder="30"
            />
          </div>
          <p class="text-danger">
            Note: you may include more input fields as needed...
          </p>
          <!-- Save/Cancel -->
          <div class="text-end mt-4">
            <button class="btn btn-primary me-2" @click="createQuiz">
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
      chapters: [],
      quizData: {
        name: "",
        chapter_id: "",
        quiz_date: "",
        duration_time: 0
      }
    }
  },
  mounted() {
    this.loadChapters()
  },
  methods: {
    loadChapters() {
      fetch("/api/chapters", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then((res) => res.json())
        .then((data) => {
          this.chapters = data
        })
        .catch((err) => console.error("Error loading chapters:", err))
    },
    createQuiz() {
      // Basic validation
      if (!this.quizData.name.trim()) {
        alert("Quiz name is required.")
        return
      }
      if (!this.quizData.quiz_date.trim()) {
        alert("Quiz date is required.")
        return
      }
      if (!this.quizData.duration_time || this.quizData.duration_time < 1) {
        alert("Duration must be at least 1 minute.")
        return
      }
      // Validate quiz_date format using regex: YYYY-MM-DD HH:MM:SS
      const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (!dateRegex.test(this.quizData.quiz_date.trim())) {
        alert("Please enter the quiz date in format YYYY-MM-DD HH:MM:SS");
        return;
      }
  
      // POST /api/quizzes (without remarks)
      fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(this.quizData)
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Quiz created:", data)
          this.$router.push("/quiz")
        })
        .catch((err) => console.error("Error creating quiz:", err))
    },
    cancel() {
      this.$router.push("/quiz")
    }
  }
};
