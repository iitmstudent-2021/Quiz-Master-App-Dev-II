export default {
  name: "QuizManagement",
  template: `
    <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
      <h2 class="mb-4 text-center">Quiz Management</h2>

      <div class="d-flex flex-wrap justify-content-start">
        <div
          v-for="quiz in quizzes"
          :key="quiz.id"
          class="card me-3 mb-3 shadow-sm"
          style="width: 300px; border: 2px solid #a5a5a5;"
        >
          <div class="card-header bg-white text-center fw-bold">
            {{ quiz.name }} (ID: {{ quiz.id }})
          </div>

          <div class="card-body">
            <div class="d-flex justify-content-between mb-2 border-bottom fw-bold">
              <span>Q_Title</span>
              <span>Action</span>
            </div>

            <!-- Each question row -->
            <div
              v-for="q in quiz.questions"
              :key="q.id"
              class="d-flex justify-content-between align-items-center mb-2"
            >
              <span>{{ q.name }}</span>
              <span>
                <button
                  class="btn btn-link p-0 text-primary"
                  @click="editQuestion(quiz.id, q.id)"
                >
                  Edit
                </button>
                /
                <button
                  class="btn btn-link p-0 text-danger"
                  @click="deleteQuestion(q.id)"
                >
                  Del
                </button>
              </span>
            </div>

            <!-- Add question button -->
            <button
              class="btn btn-sm btn-secondary w-100 mt-3"
              @click="addQuestion(quiz.id)"
            >
              + Question
            </button>

            <!-- Edit / Delete Quiz actions at bottom -->
            <div class="mt-3 d-flex justify-content-between">
              <button
                class="btn btn-warning btn-sm"
                @click="editQuiz(quiz)"
              >
                Edit Quiz
              </button>
              <button
                class="btn btn-danger btn-sm"
                @click="deleteQuiz(quiz.id)"
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- If no quizzes -->
      <div v-if="quizzes.length === 0" class="text-muted text-center fs-5 mt-4">
        All quizzes here ...
      </div>

      <!-- Floating button for adding a new quiz -->
      <button
        class="btn btn-primary rounded-circle"
        @click="addQuiz"
        style="
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
        "
      >
        +
      </button>
    </div>
  `,

  data() {
    return {
      quizzes: []
    }
  },

  mounted() {
    this.loadQuizzes()
  },

  methods: {
    loadQuizzes() {
      fetch("/api/quizzes", {
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          this.quizzes = data
        })
        .catch(err => console.error("Error loading quizzes:", err))
    },

    addQuiz() {
      this.$router.push("/add-quiz")
    },

    editQuiz(quiz) {
      this.$router.push({ name: "edit-quiz", params: { quizId: quiz.id } })
    },

    deleteQuiz(quizId) {
      if (!confirm("Are you sure you want to delete this quiz?")) return
      fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log("Quiz deleted:", data)
          this.loadQuizzes()
        })
        .catch(err => console.error("Error deleting quiz:", err))
    },

    // Add a new question to a quiz
    addQuestion(quizId) {
      this.$router.push({ name: "add-question", params: { quizId } })
    },

    // **Edit** an existing question
    editQuestion(quizId, questionId) {
      // Push to the named route "edit-question"
      this.$router.push({ name: "edit-question", params: { quizId, questionId } })
    },

    deleteQuestion(questionId) {
      if (!confirm("Are you sure you want to delete this question?")) return
      fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log("Question deleted:", data)
          // Refresh the quiz list to see changes
          this.loadQuizzes()
        })
        .catch(err => console.error("Error deleting question:", err))
    }
  }
}
