export default {
    name: "QuestionsList",
    template: `
      <div class="p-3">
        <h2 class="mb-3">All Questions</h2>
        
        <!-- If no questions -->
        <div v-if="questions.length === 0" class="text-muted">
          No questions found.
        </div>
  
        <!-- Otherwise, loop over each question -->
        <div v-else>
          <div
            v-for="q in questions"
            :key="q.id"
            class="card mb-2"
            style="border: 1px solid #ccc;"
          >
            <div class="card-body">
              <h5 class="card-title">
                {{ q.name }} (ID: {{ q.id }})
              </h5>
              <p class="card-text">
                {{ q.question_statement }}
              </p>
              <p>
                <strong>Options:</strong>
                <ul>
                  <li>1) {{ q.option_1 }}</li>
                  <li>2) {{ q.option_2 }}</li>
                  <li>3) {{ q.option_3 }}</li>
                  <li>4) {{ q.option_4 }}</li>
                </ul>
                <strong>Correct Option:</strong> {{ q.correct_option }}
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        questions: []
      }
    },
  
    mounted() {
      this.loadQuestions()
    },
  
    methods: {
      loadQuestions() {
        fetch("/api/questions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
          .then((res) => res.json())
          .then((data) => {
            // data should be an array of question objects
            this.questions = data
            console.log("Questions fetched:", data)
          })
          .catch((err) => console.error("Error loading questions:", err))
      }
    }
  }
  