
pipeline {
    agent any

    environment {
        // This injects the secret text credential with the ID 'GEMINI_API_KEY'
        // into an environment variable of the same name.
        GEMINI_API_KEY = credentials('GEMINI_API_KEY')
    }

    stages {
        stage('Checkout') {
            steps {
                // Get some code from a GitHub repository
                git 'https://github.com/your-username/your-repo.git'
                sh 'git --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install npm packages
                sh 'npm install'
            }
        }
        
        stage('Lint') {
            steps {
                // Run ESLint
                sh 'npm run lint'
            }
        }
        
        stage('Type Check') {
            steps {
                // Run TypeScript compiler to check for type errors
                sh 'npm run typecheck'
            }
        }

        stage('Test') {
            steps {
                // Run tests
                sh 'npm run test'
            }
        }

        stage('Build') {
            steps {
                // Build the Next.js application
                sh 'npm run build'
            }
        }
        
        stage('Deploy') {
            steps {
                // This is a placeholder for your deployment logic.
                // You will need to customize this stage based on your hosting environment.
                // Examples:
                // 1. Copy files to a web server:
                //    sh 'scp -r .next public package.json user@your-server:/path/to/app'
                //    sh 'ssh user@your-server "cd /path/to/app && npm install --production && pm2 restart app-name"'
                //
                // 2. Build and push a Docker image:
                //    sh 'docker build -t your-image-name:latest .'
                //    sh 'docker push your-image-name:latest'
                echo 'Deployment stage is a placeholder. Add your deployment script here.'
            }
        }
    }

    post {
        always {
            // Clean up the workspace
            cleanWs()
        }
    }
}
