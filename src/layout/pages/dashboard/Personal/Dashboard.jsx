import Wrapper from "../../../components/wrapper/wrapper";
import LocalMarketComparisonChart from "./components/LocalMarketComparison";
import LocalStackedProductionChart from "./components/LocalProduce";
import LocalProduceShareChart from "./components/LocalProduceShare";
import PersonalExpenseBarChart from "./components/PersonalExpenseBarChart";

export default function Dashboard() {
  return (
    <Wrapper>
      <PersonalExpenseBarChart />
      <LocalStackedProductionChart/>
      <LocalMarketComparisonChart/>
      <LocalProduceShareChart/>
    </Wrapper>
  );
}
