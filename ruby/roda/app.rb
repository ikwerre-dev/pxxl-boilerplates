require "roda";require "json";class App<Roda;plugin :json;route do|r|r.root{{service:"Pxxl Roda API"}};r.get("health"){{status:"ok"}};r.get("api"){{message:"Hello from Roda"}};end;end
