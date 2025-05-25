import Wrapper from "../../../components/wrapper/wrapper";
import ForestAreaAndTimberChart from "./components/ForestAreaTimber";
import OtherProduceBarChart from "./components/OtherProduceBarChart";
import TimberPurposeWordCloud from "./components/PurposeWordCloud";
import TimberNeedHarvestedGauge from "./components/TimberNeedHarvested";
import TimberRequirementLineChart from "./components/TimberRequirement";
import TimberHarvestKPICards from "./components/TimberKPICards";
import TimberSplitStackedChart from "./components/TimberSplit";

export default function Dashboard() {
  return (
    <Wrapper>
      <ForestAreaAndTimberChart />
      <TimberSplitStackedChart />
      <OtherProduceBarChart/>
      <TimberRequirementLineChart/>
      <TimberPurposeWordCloud/>
      <TimberNeedHarvestedGauge/>
      <TimberHarvestKPICards/>
    </Wrapper>
  );
}
