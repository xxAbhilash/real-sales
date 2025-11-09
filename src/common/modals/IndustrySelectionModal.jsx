import React, { useEffect, useState } from "react";
import CommonModal from "../commonModal";
import { IndustrySelectionValue } from "../../redux/OpenModal";
import { useDispatch, useSelector } from "react-redux";
import CommonButton from "../commonButton";
import ArrowRight from "../../../public/assets/icons/arrowRight";
import { useApi } from "../../hooks/useApi";
import { apis } from "../../utils/apis";
import { useRouter } from "next/router";

const IndustrySelectionModal = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { Get } = useApi();
  const { industries } = apis;

  const industrySelectionValue = useSelector(
    (state) => state.openModal.industrySelectionValue
  );

  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [industriesData, setIndustriesData] = useState([]);
  const [width, setWidth] = useState(1366);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await Get(industries);
        if (data && Array.isArray(data)) {
          setIndustriesData(data);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
      }
    };

    if (industrySelectionValue?.open) {
      fetchIndustries();
    }
  }, [industrySelectionValue?.open]);

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleProceed = () => {
    if (selectedIndustry) {
      // Store selected industry in localStorage
      localStorage.setItem("selected_industry", selectedIndustry.name);
      localStorage.setItem("selected_industry_id", selectedIndustry.industry_id);
      
      // Close modal
      dispatch(IndustrySelectionValue({ open: false, type: "" }));
      
      // Navigate to persona page
      router.push("/persona");
    }
  };

  return (
    <>
      <CommonModal
        open={industrySelectionValue?.open}
        onClose={() => dispatch(IndustrySelectionValue({ open: false, type: "" }))}
        width={width > 720 ? "50%" : "90%"}
      >
        <div className="flex flex-col gap-4 items-start">
          <div className="flex flex-col items-start">
            <h2 className="lg:text-[22px] text-[16px] m-plus-rounded-1c-regular text-[#060606] w-full flex items-center justify-start">
              Choose your Desired Industry
            </h2>
            <p className="lg:text-[30px] text-[16px] m-plus-rounded-1c-regular text-[#060606E5]">
              (Choose any one):
            </p>
          </div>

          <div className="w-full flex items-center justify-center flex-col py-4">
            <div className="w-full flex flex-wrap items-center justify-start gap-4 max-h-[400px] overflow-y-auto">
              {industriesData?.length ? (
                industriesData.map((industry, i) => (
                  <div
                    key={i}
                    className={`relative w-full rounded-[20px] overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedIndustry?.industry_id === industry?.industry_id
                        ? "border-[#FFDE5A] bg-[#FFDE5A]/10"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedIndustry(industry)}
                  >
                    <div className="p-6 w-full flex items-center gap-4">
                      <div className="cursor-pointer bg-[#FFFFFF33] w-fit h-fit p-2 rounded-full">
                        <div className="h-6 w-6 rounded-full border-2 border-solid border-[#060606] flex items-center justify-center">
                          {selectedIndustry?.industry_id === industry?.industry_id ? (
                            <div className="h-4 w-4 rounded-full bg-[#060606]" />
                          ) : null}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h1 className="m-plus-rounded-1c-medium lg:text-xl text-lg text-[#060606]">
                          {capitalize(industry?.name?.replace(/_/g, " "))}
                        </h1>
                        {industry?.description && (
                          <p className="sora-regular text-gray-600 lg:text-[14px] text-[12px] mt-1">
                            {industry.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8">
                  <p className="text-gray-500">Loading industries...</p>
                </div>
              )}
            </div>
            <CommonButton
              className={`!mt-8 !border-[2px] !border-[#060606] !text-[#060606] !font-[500] !px-6 !py-1] !text-[16px] !capitalize flex !items-center gap-2 w-fit h-fit ${
                !selectedIndustry ? "!opacity-50 !cursor-not-allowed" : ""
              }`}
              icon={<ArrowRight stroke={`#060606`} width={19} height={13} />}
              onClick={handleProceed}
              disabled={!selectedIndustry}
              buttontext={"Save & Proceed"}
            />
          </div>
        </div>
      </CommonModal>
    </>
  );
};

export default IndustrySelectionModal;

