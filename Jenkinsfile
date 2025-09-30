
pipeline {
    agent {
        // Specify a Node.js agent. You may need to configure this in your Jenkins "Global Tool Configuration".
        // Example: agent { nodejs 'NodeJS-18' }
        any
    }

    environment {
        // Ensure you have a .env file or configure environment variables in Jenkins
        // for things like GEMINI_API_KEY if your build/tests require it.
        // For example:
        // GEMINI_API_KEY = credentials('your-gemini-api-key-credential-id')
    }

    stages {
        stage('Checkout') {
            steps {
                // This will check out the code from the repository Jenkins is configured to use.
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Use 'ci' for faster, more reliable builds in a CI environment
                sh 'npm ci'
            }
        }

        stage('Lint Code') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Run Tests') {
            steps {
                // This will run the tests defined in your vitest config
                sh 'npm run test'
            }
        }

        stage('Build Application') {
            steps {
                // Create a production-ready build
                sh 'npm run build'
            }
        }

        // --- DEPLOYMENT STAGE (EXAMPLE) ---
        // stage('Deploy') {
        //     when {
        //         branch 'main' // Only deploy when the main branch is built
        //     }
        //     steps {
        //         echo 'Deploying to production...'
        //         // Add your deployment commands here.
        //         // This could be copying files, running a script, or using a Jenkins plugin.
        //         // e.g., sh 'firebase deploy --only hosting'
        //     }
        // }
    }

    post {
        always {
            // Clean up the workspace after the build
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            // You could add success notifications here (e.g., Slack, Email)
        }
        failure {
            echo 'Pipeline failed.'
            // You could add failure notifications here
        }
    }
}
