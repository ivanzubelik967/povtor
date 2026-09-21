FROM jenkins/jenkins:2.568.3-jdk21
USER root

# Устанавливаем зависимости и docker-ce-cli
RUN apt-get update && apt-get install -y lsb-release ca-certificates curl && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/debian $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && apt-get install -y docker-ce-cli && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Создаем группу docker (если её нет) и добавляем в неё пользователя jenkins.
# ВНИМАНИЕ: Если на хост-машине GID группы docker отличается от стандартного, 
# внутри контейнера может возникнуть Permission Denied при обращении к сокету.
RUN groupadd -g 987 docker || true && \
    usermod -aG docker jenkins

USER jenkins
RUN jenkins-plugin-cli --plugins "blueocean docker-workflow json-path-api"

