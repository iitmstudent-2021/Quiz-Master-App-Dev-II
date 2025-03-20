export default {
  name: "AttemptQuiz",
  template: `
    <div class="p-4" style="background-color: #fff;">
      <h2 class="mb-4 text-center">Attempt Quiz: {{ quizData.name }}</h2>

      <!-- Timer Display -->
      <div v-if="remainingTime !== null" class="text-end">
        <span class="px-3 py-1 rounded-pill text-white fw-bold"
          style="background-color: #6cb2eb; font-size: 1.2rem;">
          {{ formattedTime }}
        </span>
      </div>

      <div v-if="quizData.questions && quizData.questions.length">
        <div v-for="(q, index) in quizData.questions" :key="q.id" class="mb-4 p-2 border rounded">
          <h5>Q{{ index + 1 }}: {{ q.question_statement }}</h5>
          <div class="form-check" v-for="option in [1,2,3,4]" :key="option">
            <input
              class="form-check-input"
              type="radio"
              :name="'question_'+q.id"
              :value="option"
              v-model="answers[q.id]"
            />
            <label class="form-check-label">
              {{ option }}) {{ q['option_' + option] }}
            </label>
          </div>
        </div>

        <div class="d-flex justify-content-between">
          <button class="btn btn-success" @click="submitAnswers">Submit</button>
        </div>
      </div>

      <div v-else class="text-muted">No questions found for this quiz...</div>

      <div v-if="score !== null" class="mt-3">
        <h4>Your Score: {{ score }}</h4>
      </div>
    </div>
  `,

  data() {
    return {
      quizData: {},       // Stores the quiz object
      answers: {},        // { questionId: chosenOption, ... }
      score: null,        // After submission, show the score
      remainingTime: null, // Stores remaining time in seconds
      timerInterval: null // Stores timer interval reference
    }
  },

  computed: {
    formattedTime() {
      const hours = Math.floor(this.remainingTime / 3600);
      const minutes = Math.floor((this.remainingTime % 3600) / 60);
      const seconds = this.remainingTime % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  },

  mounted() {
    this.loadQuiz();
  },

  methods: {
    loadQuiz() {
      const quizId = this.$route.params.quizId;
      fetch(`/api/quizzes/${quizId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then((res) => res.json())
      .then((data) => {
        this.quizData = data;
        this.initializeAnswers();
        this.startTimer(data.duration_time);
      })
      .catch((err) => console.error("Error loading quiz:", err));
    },

    initializeAnswers() {
      if (this.quizData.questions) {
        this.quizData.questions.forEach((q) => {
          this.$set(this.answers, q.id, null);
        });
      }
    },

    startTimer(duration) {
      if (!duration) return;

      // Convert duration (in HH:MM:SS or MM:SS format) to seconds
      const timeParts = duration.split(":").map(Number);
      if (timeParts.length === 3) {
        this.remainingTime = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      } else {
        this.remainingTime = timeParts[0] * 60 + timeParts[1]; // MM:SS
      }

      this.timerInterval = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
        } else {
          clearInterval(this.timerInterval);
          this.submitAnswers();
        }
      }, 1000);
    },

    saveAndNext() {
      console.log("Answer saved for current question.");
    },

    submitAnswers() {
      if (this.timerInterval) clearInterval(this.timerInterval); // Stop the timer on submission

      const quizId = this.$route.params.quizId;
      const payload = { answers: {} };
      for (let qid in this.answers) {
        if (this.answers[qid]) {
          payload.answers[qid] = parseInt(this.answers[qid]);
        }
      }

      fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.score !== undefined) {
          this.score = data.score;
        } else if (data.message) {
          alert(data.message);
        }
      })
      .catch((err) => console.error("Error submitting attempt:", err));
    }
  },

  beforeDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval); // Clear timer on component unload
  }
};
