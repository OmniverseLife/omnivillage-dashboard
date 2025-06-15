import Wrapper from "../../../components/wrapper/wrapper";
import BusinessDetailsCharts from "./components/BusinessDetails";
import BusinessStartedChart from "./components/BusinessTimeline";
import BusinessTypeDistributionChart from "./components/GetBusinessTypeDistribution";
import InvestmentIncomeChart from "./components/InvestmentIncome";
import LegalStructureDistributionChart from "./components/LegalStructureDistribution";
import ManpowerSourceChart from "./components/ManpowerSource";
import ResourceConsumptionChart from "./components/ResourceConsumption";
import SupportNeedChart from "./components/SupportNeed";

export default function Dashboard() {
  return (
    <Wrapper>
      <BusinessTypeDistributionChart />
      <BusinessStartedChart />
      <LegalStructureDistributionChart />
      <InvestmentIncomeChart />
      {/* <ManpowerSourceChart /> */}
      <ResourceConsumptionChart/>
      <SupportNeedChart/>
      <BusinessDetailsCharts/>
    </Wrapper>
  );
}
