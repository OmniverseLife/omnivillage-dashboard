import React from 'react'
import Wrapper from '../../../components/wrapper/wrapper'
import WaterConsumptionHistogram from './components/WaterConsumption'
import WaterSourcesDonutChart from './components/WaterSources'
import SourceQualityHeatmap from './components/SourceQuality'
import SourceExpenseLineChart from './components/SourceExpense'
import RainwaterHarvestingCapacityChart from './components/HarvestingCapacity'
import WasteDisposalStackedBarChart from './components/WaterDisposal'
import WasteRecyclingDonutChart from './components/WaterRecycle'
import WasteScarcityGroupedBarChart from './components/WaterScarcity'

export default function Dashboard() {
  return (
    <Wrapper>
      <WaterConsumptionHistogram/>
      <WaterSourcesDonutChart/>
      <SourceQualityHeatmap/>
      <SourceExpenseLineChart/>
      <RainwaterHarvestingCapacityChart/>
      <WasteDisposalStackedBarChart/>
      <WasteRecyclingDonutChart/>
      <WasteScarcityGroupedBarChart/>
    </Wrapper>
  )
}
