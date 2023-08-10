(ns main
  (:require ["http" :as http]
            ["url" :as url]
            ["fs" :as fs]))

(def API_KEY js/process.env.OPENAI_API_KEY)

(def CHAT_API_URL "https://api.openai.com/v1/chat/completions")

(defn http-post [url bearer payload]
  (js/fetch url (clj->js {:method "POST"
                          :headers {"Content-Type" "application/json"
                                    "Authorization" (str "Bearer " bearer)}
                          :body (js/JSON.stringify (clj->js payload))})))

;; https://platform.openai.com/docs/api-reference/chat
(defn call-chat-api [messages]
  (let [payload {:model "gpt-3.5-turbo" :messages messages}
        promise (http-post CHAT_API_URL API_KEY payload)]
    (.then promise (fn [response] (.json response)))))

(defonce llm-messages (atom [{:role "system"
                              :content "You are a helpful assistant."}
                             {:role "system"
                              :content "Answer in 50 words or less."}
                             {:role "user"
                              :content "What is the biggest planet in our solar system?"}
                             {:role "assistant"
                              :content "Jupiter."}]))

(defn add-message! [role content]
  (swap! llm-messages conj {:role role :content content}))

(defonce assistant-response (atom {:index 0 :answer "..."}))

(defn print-answer [resolved]
  (let [response (js->clj resolved :keywordize-keys true)
        answer (-> response :choices first :message :content)]
    (add-message! "assistant" answer)
    (js/console.log "Assistant:" answer)
    (reset! assistant-response {:index (inc (:index @assistant-response))
                                :answer answer})))

(defn llm-ask [question]
  (add-message! "user" question)
  (js/console.log "User:" question)
  (let [promise (call-chat-api @llm-messages)]
    (.then promise print-answer)))

(defn serve-index-html [response]
  (.writeHead response 200 #js{:content-type "text/html"})
  (.end response (fs/readFileSync "./public/index.html")))

(defn serve-index-js [response]
  (.writeHead response 200 #js{:content-type "application/javascript"})
  (.end response (fs/readFileSync "./public/index.js")))

(defn serve-style-css [response]
  (.writeHead response 200 #js{:content-type "text/css"})
  (.end response (fs/readFileSync "./public/style.css")))

(defn serve-question [request response]
  (let [parsed-url  (-> request .-url url/parse)
        question (-> parsed-url .-query js/decodeURIComponent)]
    (llm-ask question)
    (.writeHead response 200 #js{:content-type "text/plain"})
    (.end response (str question))))

(defn serve-answer [response]
  (.writeHead response 200 #js{:content-type "application/json"})
  (.end response (js/JSON.stringify (clj->js @assistant-response))))

(defn serve-404 [response]
  (.writeHead response 404)
  (.end response))

(defn handler [request response]
  (let [url (.-url request)]
    (cond
      (= url "/") (serve-index-html response)
      (= url "/index.html") (serve-index-html response)
      (= url "/style.css") (serve-style-css response)
      (= url "/index.js") (serve-index-js response)
      (= url "/answer") (serve-answer response)
      (.startsWith url "/question") (serve-question request response)
      :else (serve-404 response))))

(defn start-server [port]
  (let [server (http/createServer handler)]
    (js/console.log "Listening on port" port)
    (.listen server port)))

(def cli-args
  (not-empty (js->clj (.slice js/process.argv 3))))

(defn main [_]
  (if (empty? API_KEY)
    (js/console.error "No API key, please set OPENAPI_API_KEY!")
    (start-server 5000)))

(main cli-args)

(comment

  (llm-ask "Sebutkan satu nama masakan khas dari Padang")
  (llm-ask "Bagaimana cara memasaknya")

  (llm-ask "Apa ibukota Jawa Timur?")
  (llm-ask "Berapa jaraknya ke Jakarta?")

  ;; moar playboard
  )