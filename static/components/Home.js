export default {
    name: "Home",
    template: `
      <div class="row border">
        <div class="col text-center" style="height: 750px;">
          <img src="static/quiz_master.png" alt="Home" class="img-fluid" style="max-height: 500px;">
          <div class="mt-3">
            <button class="btn btn-primary btn-lg" @click="redirectToLogin">
              Login
            </button>
          </div>
        </div>
      </div>
    `,
    methods: {
      redirectToLogin() {
        this.$router.push('/login');
      }
    }
  }
  