FROM registry.cn-shenzhen.aliyuncs.com/zpublic/z-nodejs:znodejs

RUN ln -snf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone

RUN mkdir /app
WORKDIR /app

ENV PORT=12002
ENV LOG_LEVEL=info
ENV NODE_ENV=staging

COPY . /app
RUN npm install
RUN npm run build
CMD ["node", "/app/dist/app.js"]
EXPOSE 12002