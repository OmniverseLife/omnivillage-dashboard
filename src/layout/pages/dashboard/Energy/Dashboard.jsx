import Wrapper from "../../../components/wrapper/wrapper";
import EnergyPerCapitaChart from "./components/EnergyPerCapita";
import FuelTypeDonutChart from "./components/FuelType";
import GridAccessPieChart from "./components/GridAccessPieChart";
import KwhConsumptionHistogram from "./components/KWHConsumption";
import MicroGridUsageChart from "./components/Microgrid";
import OtherFuelsBarChart from "./components/OtherFuels";
import RenewableShareDonutChart from "./components/RenewableShare";
import SpendVsConsumptionScatterChart from "./components/SpendConsumtion";

export default function Dashboard() {
  return (
    <Wrapper>
      <GridAccessPieChart />
      <KwhConsumptionHistogram />
      <SpendVsConsumptionScatterChart />
      <FuelTypeDonutChart />
      <OtherFuelsBarChart />
      <MicroGridUsageChart />
      <RenewableShareDonutChart />
      <EnergyPerCapitaChart/>
    </Wrapper>
  );
}
