export default {
    name: "SearchComponent",
    template: `
      <div class="p-4" style="background-color: #f9fcff; min-height: 100vh;">
        <h2 class="mb-4 text-center">Search Results</h2>
  
        <div v-if="results.users.length || results.subjects.length || results.quizzes.length">
          <div v-if="results.users.length">
            <h4>Users</h4>
            <ul class="list-group">
              <li v-for="user in results.users" :key="user.id" class="list-group-item">
                {{ user.username }} ({{ user.email }})
              </li>
            </ul>
          </div>
  
          <div v-if="results.subjects.length">
            <h4 class="mt-4">Subjects</h4>
            <ul class="list-group">
              <li v-for="subject in results.subjects" :key="subject.id" class="list-group-item">
                {{ subject.name }}
              </li>
            </ul>
          </div>
  
          <div v-if="results.quizzes.length">
            <h4 class="mt-4">Quizzes</h4>
            <ul class="list-group">
              <li v-for="quiz in results.quizzes" :key="quiz.id" class="list-group-item">
                {{ quiz.name }} - {{ new Date(quiz.quiz_date).toLocaleDateString() }}
              </li>
            </ul>
          </div>
        </div>
        
        <div v-else class="text-muted text-center mt-4">
          No results found for "{{ searchQuery }}"
        </div>
      </div>
    `,
    data() {
      return {
        searchQuery: this.$route.query.q || "",
        results: { users: [], subjects: [], quizzes: [] }
      };
    },
    mounted() {
      this.performSearch();
    },
    watch: {
      "$route.query.q"(newQuery) {
        this.searchQuery = newQuery;
        this.performSearch();
      }
    },
    methods: {
      performSearch() {
        fetch(`/api/search?query=${encodeURIComponent(this.searchQuery)}`, {
          headers: { "Authentication-Token": localStorage.getItem("auth_token") }
        })
          .then(res => res.json())
          .then(data => {
            this.results = data;
          })
          .catch(err => console.error("Error fetching search results:", err));
      }
    }
  };
  