import React from "react";
import Wrapper from "../components/wrapper/wrapper";
import DemographicOfficerDropdown from "../components/ModeratorDropdowns/demographic";
// import LandholdingOfficerDropdown from "../components/moderatorDropdowns/landholding";
import WaterOfficerDropdown from "../components/ModeratorDropdowns/water";
import EnergyOfficerDropdown from "../components/ModeratorDropdowns/energy";
import MobilityOfficerDropdown from "../components/ModeratorDropdowns/mobility";
import ForestryOfficerDropdown from "../components/ModeratorDropdowns/forestry";
import BusinessOfficerDropdown from "../components/ModeratorDropdowns/business";
import CommunityOfficerDropdown from "../components/ModeratorDropdowns/community";
import { Stack } from "@mui/material";

export default function ModeratorDropdowns() {
    return (
        <Wrapper>
            <Stack direction="column" spacing={10}>
                <DemographicOfficerDropdown />
                {/* <LandholdingOfficerDropdown /> */}
                <WaterOfficerDropdown />
                <EnergyOfficerDropdown />
                <MobilityOfficerDropdown />
                <ForestryOfficerDropdown />
                <BusinessOfficerDropdown />
                <CommunityOfficerDropdown />
            </Stack>
        </Wrapper>
    );
}
