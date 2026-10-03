const assetPathPrefix = "./assets";
const imgVuesaxBoldArrowRight = `${assetPathPrefix}/5f10f.svg`;
const imgVuesaxBoldArrowLeft = `${assetPathPrefix}/84fb8.svg`;
const imgFrame1000000891 = `${assetPathPrefix}/0cd14.svg`;
const imgArrowLeft = `${assetPathPrefix}/a837c.svg`;

function VuesaxBoldArrowRight({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[14px]"} data-node-id="1:2587" data-name="vuesax/bold/arrow-right">
      <div className="absolute contents inset-0" data-node-id="1:2588" data-name="vuesax/bold/arrow-right">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVuesaxBoldArrowRight} />
      </div>
    </div>
  );
}

function VuesaxBoldArrowLeft({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[14px]"} data-node-id="1:2582" data-name="vuesax/bold/arrow-left">
      <div className="absolute contents inset-0" data-node-id="1:2583" data-name="vuesax/bold/arrow-left">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVuesaxBoldArrowLeft} />
      </div>
    </div>
  );
}

export default function SelectTime() {
  return (
    <div className="bg-white overflow-clip relative rounded-[54px] size-full" data-node-id="1:2547" data-name="Select Time">
      <div className="absolute bottom-0 content-stretch flex flex-col gap-[8px] h-[844px] items-start right-0 w-[390px]" data-node-id="1:2548">
        <div className="h-[51px] relative shrink-0 w-[390px]" data-node-id="1:2549" data-name="Statusbar">
          <div className="absolute h-[11.333px] left-[308.67px] top-[21.33px] w-[66.601px]" data-node-id="1:2550">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame1000000891} />
          </div>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Regular'] h-[17px] leading-[normal] left-[38px] not-italic text-[14px] text-black text-center top-[calc(50%-5.5px)] tracking-[-0.28px] w-[30px]" data-node-id="1:2565">
            9:41
          </p>
        </div>
        <div className="bg-white content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px overflow-clip relative w-full" data-node-id="1:2566" data-name="Content">
          <div className="content-stretch flex items-center justify-between px-[24px] py-[10px] relative shrink-0 w-full" data-node-id="1:2567" data-name="Title/Back-icon">
            <div className="relative shrink-0 size-[24px]" data-node-id="1:2568" data-name="arrow-left">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
            </div>
            <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#374151] text-[20px] whitespace-nowrap" data-node-id="1:2572">
              Book Appointment
            </p>
            <div className="h-[9px] relative shrink-0 w-[24px]" data-node-id="1:2573" />
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-between min-h-px relative w-full" data-node-id="1:2574" data-name="Container">
            <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-node-id="1:2575" data-name="Select Date & Hour">
              <div className="content-stretch flex flex-col gap-[8px] items-start px-[24px] relative shrink-0 w-full" data-node-id="1:2576" data-name="Select Date">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#1c2a3a] text-[20px] whitespace-nowrap" dir="auto" data-node-id="1:2577">
                  Select Date
                </p>
                <div className="bg-[#f9fafb] content-stretch flex flex-col gap-[8px] items-center overflow-clip p-[16px] relative rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-node-id="1:2578" data-name="Datepicker Dropdown">
                  <div className="content-stretch flex items-center justify-between overflow-clip py-[2px] relative shrink-0 w-full" data-node-id="1:2579" data-name="Header">
                    <div className="[word-break:break-word] flex flex-col font-['Inter:Bold'] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#111928] text-[14px] w-[126px]" data-node-id="1:2580">
                      <p className="leading-[1.5]">June 2023</p>
                    </div>
                    <div className="content-stretch flex items-start relative shrink-0" data-node-id="1:2581" data-name="Arrows">
                      <VuesaxBoldArrowLeft className="relative shrink-0 size-[14px]" />
                      <VuesaxBoldArrowRight className="relative shrink-0 size-[14px]" />
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="1:2592" data-name="Body">
                    <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:2593" data-name="Week">
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px overflow-clip px-[4px] py-[8px] relative" data-node-id="1:2594" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#4b5563] text-[12px] text-center w-full" data-node-id="1:2595">
                          Sun
                        </p>
                      </div>
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px overflow-clip px-[4px] py-[8px] relative" data-node-id="1:2596" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#4b5563] text-[12px] text-center w-full" data-node-id="1:2597">
                          Mon
                        </p>
                      </div>
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px overflow-clip px-[4px] py-[8px] relative" data-node-id="1:2598" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#4b5563] text-[12px] text-center w-full" data-node-id="1:2599">
                          Tue
                        </p>
                      </div>
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px overflow-clip px-[4px] py-[8px] relative" data-node-id="1:2600" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#4b5563] text-[12px] text-center w-full" data-node-id="1:2601">
                          Wed
                        </p>
                      </div>
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px overflow-clip px-[4px] py-[8px] relative" data-node-id="1:2602" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#4b5563] text-[12px] text-center w-full" data-node-id="1:2603">
                          Thu
                        </p>
                      </div>
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px overflow-clip px-[4px] py-[8px] relative" data-node-id="1:2604" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#4b5563] text-[12px] text-center w-full" data-node-id="1:2605">
                          Fri
                        </p>
                      </div>
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px overflow-clip px-[4px] py-[8px] relative" data-node-id="1:2606" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#4b5563] text-[12px] text-center w-full" data-node-id="1:2607">
                          Sat
                        </p>
                      </div>
                    </div>
                    <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:2608" data-name="Week">
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2609" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center w-full" data-node-id="1:2610">
                          1
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2611" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center w-full" data-node-id="1:2612">
                          2
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2613" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center w-full" data-node-id="1:2614">
                          3
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2615" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center w-full" data-node-id="1:2616">
                          4
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2617" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center w-full" data-node-id="1:2618">
                          5
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2619" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center w-full" data-node-id="1:2620">
                          6
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2621" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center w-full" data-node-id="1:2622">
                          7
                        </p>
                      </div>
                    </div>
                    <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:2623" data-name="Week">
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2624" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center whitespace-nowrap" data-node-id="1:2625">
                          8
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2626" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2627">
                          9
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2628" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2629">
                          10
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2630" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2631">
                          11
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2632" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2633">
                          12
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2634" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2635">
                          13
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2636" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center whitespace-nowrap" data-node-id="1:2637">
                          14
                        </p>
                      </div>
                    </div>
                    <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:2638" data-name="Week">
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2639" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center whitespace-nowrap" data-node-id="1:2640">
                          15
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2641" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2642">
                          16
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2643" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2644">
                          17
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2645" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2646">
                          18
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2647" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2648">
                          19
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2649" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2650">
                          20
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2651" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center whitespace-nowrap" data-node-id="1:2652">
                          21
                        </p>
                      </div>
                    </div>
                    <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:2653" data-name="Week">
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2654" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center whitespace-nowrap" data-node-id="1:2655">
                          22
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2656" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2657">
                          23
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2658" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2659">
                          24
                        </p>
                      </div>
                      <div className="bg-[#1c2a3a] content-stretch flex flex-col items-center overflow-clip px-[2px] py-[6px] relative rounded-[8px] shrink-0 w-[36px]" data-node-id="1:2660" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" data-node-id="1:2661">
                          30
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2662" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2663">
                          26
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2664" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2665">
                          27
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2666" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center whitespace-nowrap" data-node-id="1:2667">
                          28
                        </p>
                      </div>
                    </div>
                    <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="1:2668" data-name="Week">
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2669" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center whitespace-nowrap" data-node-id="1:2670">
                          29
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2671" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2672">
                          30
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2673" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2674">
                          1
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2675" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2676">
                          2
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2677" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2678">
                          3
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2679" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[12px] text-center whitespace-nowrap" data-node-id="1:2680">
                          4
                        </p>
                      </div>
                      <div className="content-stretch flex flex-col items-center overflow-clip px-[4px] py-[8px] relative shrink-0 w-[36px]" data-node-id="1:2681" data-name="Day">
                        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[1.5] not-italic relative shrink-0 text-[#d1d5db] text-[12px] text-center whitespace-nowrap" data-node-id="1:2682">
                          5
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[16px] items-start px-[24px] relative shrink-0 w-full" data-node-id="1:2683" data-name="Select Hour">
                <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#1c2a3a] text-[20px] whitespace-nowrap" dir="auto" data-node-id="1:2684">
                  Select Hour
                </p>
                <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-node-id="1:2685" data-name="Hours Tabs">
                  <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-node-id="1:2686" data-name="Tabs">
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2687" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2688">
                        09.00 AM
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2689" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2690">
                        09.30 AM
                      </p>
                    </div>
                    <div className="bg-[#1c2a3a] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2691" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:2692">
                        10.00 AM
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-node-id="1:2693" data-name="Tabs">
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2694" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2695">
                        10.30 AM
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2696" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2697">
                        11.00 AM
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2698" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2699">
                        11.30 AM
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-node-id="1:2700" data-name="Tabs">
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2701" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2702">
                        3.00 PM
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2703" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2704">
                        3.30 PM
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2705" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2706">
                        4.00 PM
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-node-id="1:2707" data-name="Tabs">
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2708" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2709">
                        4.30 PM
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2710" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2711">
                        5.00 PM
                      </p>
                    </div>
                    <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[14px] py-[10px] relative rounded-[8px] shrink-0 w-[105px]" data-node-id="1:2712" data-name="Tab">
                      <p className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[1.5] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap" data-node-id="1:2713">
                        5.30 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center justify-center p-[24px] relative shrink-0 w-[390px]" data-node-id="1:2714" data-name="Menu bar">
              <div aria-hidden className="absolute bg-white inset-0 pointer-events-none" />
              <div className="bg-[#1c2a3a] content-stretch flex flex-[1_0_0] items-center justify-center min-w-px px-[20px] py-[12px] relative rounded-[50px]" data-node-id="1:2715" data-name="Button">
                <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.5] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap" dir="auto" data-node-id="1:2716">
                  Confirm
                </p>
              </div>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_#f6f6f6]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}