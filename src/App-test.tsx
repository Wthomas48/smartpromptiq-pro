import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import Questionnaire from "@/pages/Questionnaire";
import Generation from "@/pages/Generation";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/categories" component={Categories} />
      <Route path="/questionnaire/:category" component={Questionnaire} />
      <Route path="/generation" component={Generation} />
      <Route>404 - Not Found</Route>
    </Switch>
  );
}

export default App;
