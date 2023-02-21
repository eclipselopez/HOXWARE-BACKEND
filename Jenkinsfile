pipeline {
    agent any
    environment {
        DOCKERHUB = 'grupojinim'
    }
    stages {

        stage('Clone repository') {
            steps {
                git branch: 'dev', credentialsId: 'github-credentials', url: 'https://github.com/GrupoJinimSAdeCV/avera-authentication-microservice.git'
            }
        }

        stage('Build docker image') {
            environment {
                VERSION = """${sh(returnStdout: true, script: 'jq -r .version ./package.json | xargs').trim()}"""
                NAME = """${sh(returnStdout: true, script: 'jq -r .name ./package.json | xargs').trim()}"""
            }
            steps {
                sh 'docker build . -t $NAME:$VERSION'
            }
        }

        stage('Create tag for a new docker image') {
            environment {
                VERSION = """${sh(returnStdout: true, script: 'jq -r .version ./package.json | xargs').trim()}"""
                NAME = """${sh(returnStdout: true, script: 'jq -r .name ./package.json | xargs').trim()}"""
            }
            steps {
                sh 'docker tag $NAME:$VERSION $DOCKERHUB/$NAME:$VERSION'
            }
        }

        stage('Push new image to Dockerhub') {
            environment {
                VERSION = """${sh(returnStdout: true, script: 'jq -r .version ./package.json | xargs').trim()}"""
                NAME = """${sh(returnStdout: true, script: 'jq -r .name ./package.json | xargs').trim()}"""
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                    sh 'docker login -u $USERNAME -p $PASSWORD docker.io'
                    sh 'docker push $USERNAME/$NAME:$VERSION'
                }
            }
        }

        stage('Deploy into kubernetes cluster') {
            environment {
                VERSION = """${sh(returnStdout: true, script: 'jq -r .version ./package.json | xargs').trim()}"""
                NAME = """${sh(returnStdout: true, script: 'jq -r .name ./package.json | xargs').trim()}"""
            }

            steps {
                withKubeConfig([credentialsId: 'kubernetes-credentials', serverUrl: 'https://aa95d2e5-ddb4-456f-9289-25be9076d95c.k8s.ondigitalocean.com']) {
                    sh "sed -i 's|NAME|${NAME}|' ${WORKSPACE}/k8s/deployment.yaml"
                    sh "sed -i 's|IMAGE|${DOCKERHUB}/${NAME}:${VERSION}|' ${WORKSPACE}/k8s/deployment.yaml"
                    sh 'kubectl apply -f ${WORKSPACE}/k8s/deployment.yaml'
                }
            }
        }

    }
}