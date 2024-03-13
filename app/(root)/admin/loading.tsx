import { Button, Divider, Skeleton, Spinner } from "@nextui-org/react";
import React from "react";
import { PiMicrosoftExcelLogo } from "react-icons/pi";

const loading = () => {
  return (
    <div className="p-6">
      <div className="text-2xl font-bold text-blue-600">Admin Dashboard</div>
      <Divider className="my-10" />
      <div className="flex items-end justify-end mb-6">
        <Skeleton>
          <Button
            startContent={<PiMicrosoftExcelLogo size={20} />}
            color="success"
          >
            Generate Report
          </Button>
        </Skeleton>
      </div>
      <div className="flex justify-center items-center">
        <Spinner />
      </div>
    </div>
  );
};

export default loading;
