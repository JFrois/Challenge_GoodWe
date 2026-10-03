const assetPathPrefix = "./assets";
const imgLogo = `${assetPathPrefix}/b8086.png`;
const imgImage = `${assetPathPrefix}/a7fbe.png`;
const imgImage1 = `${assetPathPrefix}/edaa9.png`;
const imgImage2 = `${assetPathPrefix}/f379f.png`;
const imgImage3 = `${assetPathPrefix}/673b5.png`;
const imgNrdZmmAnliy1D4Unsplash1 = `${assetPathPrefix}/1e4a5.png`;
const imgPlus41 = `${assetPathPrefix}/7d17b.svg`;
const imgDivider = `${assetPathPrefix}/46273.svg`;
const imgIcon = `${assetPathPrefix}/5f8c0.svg`;
const imgFrame11678 = `${assetPathPrefix}/7c557.svg`;
const imgFrame11679 = `${assetPathPrefix}/55c2e.svg`;
const imgFrame11680 = `${assetPathPrefix}/cebb3.svg`;
const imgIcon1 = `${assetPathPrefix}/832be.svg`;
const imgSignal = `${assetPathPrefix}/c26da.svg`;
const imgConnection = `${assetPathPrefix}/89d45.svg`;
const imgBattery = `${assetPathPrefix}/0669c.svg`;
const imgArrowRight = `${assetPathPrefix}/6772d.svg`;

export default function Home() {
  return (
    <div className="bg-[#f3eee9] relative size-full" data-node-id="1:367" data-name="Home">
      <div className="absolute content-stretch flex flex-col gap-[8px] items-center left-0 right-0 top-[111px]" data-node-id="1:368" data-name="Content">
        <div className="content-stretch flex flex-col gap-[4px] items-start p-[24px] relative shrink-0 w-full" data-node-id="1:369" data-name="New Topic">
          <p className="[word-break:break-word] font-['Bricolage_Grotesque:SemiBold'] font-semibold leading-[48px] relative shrink-0 text-[#0a0a0a] text-[40px] tracking-[-1.6px] w-full" dir="auto" data-node-id="1:370" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
            Start a new chat
          </p>
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-node-id="1:371" data-name="Frame">
            <p className="[word-break:break-word] font-['Bricolage_Grotesque:SemiBold'] font-semibold leading-[48px] relative shrink-0 text-[#0a0a0a] text-[40px] text-center tracking-[-1.6px] whitespace-nowrap" dir="auto" data-node-id="1:372" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
              With
            </p>
            <div className="relative rounded-[36px] shrink-0 size-[42px]" data-node-id="1:373" data-name="Logo">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[36px] size-full" src={imgLogo} />
            </div>
          </div>
          <div className="content-stretch flex items-center justify-end relative shrink-0 w-full" data-node-id="1:375" data-name="Frame">
            <p className="[word-break:break-word] bg-clip-text flex-[1_0_0] font-['Bricolage_Grotesque:SemiBold'] font-semibold leading-[48px] min-w-px relative text-[40px] text-[transparent] tracking-[-1.6px]" dir="auto" data-node-id="1:376" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100', backgroundImage: "linear-gradient(187.4070358352713deg, rgb(232, 160, 137) 18.979%, rgb(97, 42, 116) 81.22%), linear-gradient(187.4070358352713deg, rgb(215, 193, 0) 18.979%, rgb(49, 142, 103) 81.22%), linear-gradient(187.4070358352713deg, rgb(246, 43, 92) 18.979%, rgb(5, 0, 255) 81.22%)" }}>
              Chat bot AI
            </p>
            <div className="bg-[#612a74] content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[16px] relative rounded-bl-[36px] rounded-br-[8px] rounded-tl-[36px] rounded-tr-[36px] shrink-0" data-node-id="1:377" data-name="Button">
              <div className="relative shrink-0 size-[24px]" data-node-id="I1:377;0:809" data-name="Icon placeholder">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPlus41} />
              </div>
              <p className="[word-break:break-word] font-['SF_Pro_Rounded:Bold'] leading-[20px] not-italic relative shrink-0 text-[#f3eee9] text-[16px] whitespace-nowrap" data-node-id="I1:377;0:810" style={{ fontFeatureSettings: '"ss07" 1' }}>
                New Topic
              </p>
            </div>
          </div>
        </div>
        <div className="h-0 relative shrink-0 w-full" data-node-id="1:378" data-name="Divider">
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={imgDivider} />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-center p-[24px] relative shrink-0 w-full" data-node-id="1:379" data-name="History">
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-node-id="1:380" data-name="Title">
            <p className="[word-break:break-word] font-['SF_Pro_Rounded:Semibold'] leading-[32px] not-italic relative shrink-0 text-[#0a0a0a] text-[24px] tracking-[-0.48px] whitespace-nowrap" dir="auto" data-node-id="1:381" style={{ fontFeatureSettings: '"ss03" 1, "ss07" 1, "liga" 0, "kern" 0' }}>
              History
            </p>
            <div className="border border-[rgba(119,111,105,0.28)] border-solid content-stretch flex flex-[1_0_0] gap-[8px] items-center justify-end min-w-px px-[24px] py-[12px] relative rounded-[32px]" data-node-id="1:382" data-name="Searchbox">
              <p className="[word-break:break-word] capitalize flex-[1_0_0] font-['SF_Pro_Rounded:Medium'] leading-[20px] min-w-px not-italic relative text-[#776f69] text-[16px]" data-node-id="1:383">
                Search ...
              </p>
              <div className="relative shrink-0 size-[24px]" data-node-id="1:384" data-name="Icon">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon} />
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-node-id="1:385" data-name="Tabs">
            <div className="border border-[rgba(119,111,105,0.28)] border-solid content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[32px] shrink-0" data-node-id="1:386" data-name="Chips">
              <div className="relative shrink-0 size-[24px]" data-node-id="I1:386;0:1094">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame11678} />
              </div>
              <p className="[word-break:break-word] capitalize font-['SF_Pro_Rounded:Medium'] leading-[20px] not-italic relative shrink-0 text-[#776f69] text-[16px] text-center whitespace-nowrap" data-node-id="I1:386;0:1095">
                Chats
              </p>
            </div>
            <div className="border border-[rgba(119,111,105,0.28)] border-solid content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[32px] shrink-0" data-node-id="1:387" data-name="Chips">
              <div className="relative shrink-0 size-[24px]" data-node-id="I1:387;0:1094">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame11679} />
              </div>
              <p className="[word-break:break-word] capitalize font-['SF_Pro_Rounded:Medium'] leading-[20px] not-italic relative shrink-0 text-[#776f69] text-[16px] text-center whitespace-nowrap" data-node-id="I1:387;0:1095">
                Archived
              </p>
            </div>
            <div className="bg-[#0a0a0a] content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[32px] shrink-0" data-node-id="1:388" data-name="Chips">
              <div className="relative shrink-0 size-[24px]" data-node-id="I1:388;0:1097">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame11679} />
              </div>
              <p className="[word-break:break-word] capitalize font-['SF_Pro_Rounded:Medium'] leading-[20px] not-italic relative shrink-0 text-[#f3eee9] text-[16px] text-center whitespace-nowrap" data-node-id="I1:388;0:1098">
                Images
              </p>
            </div>
            <div className="border border-[rgba(119,111,105,0.28)] border-solid content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[12px] relative rounded-[32px] shrink-0" data-node-id="1:389" data-name="Chips">
              <div className="relative shrink-0 size-[24px]" data-node-id="I1:389;0:1094">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFrame11680} />
              </div>
              <p className="[word-break:break-word] capitalize font-['SF_Pro_Rounded:Medium'] leading-[20px] not-italic relative shrink-0 text-[#776f69] text-[16px] text-center whitespace-nowrap" data-node-id="I1:389;0:1095">
                Exports
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[8px] items-start justify-center px-[8px] relative shrink-0 w-[428px]" data-node-id="1:413" data-name="Images">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative" data-node-id="1:414" data-name="Left">
              <div className="backdrop-blur-[15px] h-[300px] overflow-clip relative rounded-[36px] shrink-0 w-full" data-node-id="1:415" data-name="Image">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
                <div className="absolute backdrop-blur-[25px] bg-[rgba(255,255,255,0.4)] bottom-[20px] content-stretch flex gap-[8px] items-center justify-center left-[14px] px-[16px] py-[8px] rounded-[32px]" data-node-id="I1:415;0:393" data-name="Frame">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I1:415;0:395" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-[15px] h-[299px] overflow-clip relative rounded-[36px] shrink-0 w-full" data-node-id="1:416" data-name="Image">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
                <div className="absolute backdrop-blur-[25px] bg-[rgba(255,255,255,0.4)] bottom-[20px] content-stretch flex gap-[8px] items-center justify-center left-[14px] px-[16px] py-[8px] rounded-[32px]" data-node-id="I1:416;0:393" data-name="Frame">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I1:416;0:395" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-[15px] h-[273px] overflow-clip relative rounded-[36px] shrink-0 w-full" data-node-id="1:417" data-name="Image">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
                <div className="absolute backdrop-blur-[25px] bg-[rgba(255,255,255,0.4)] bottom-[20px] content-stretch flex gap-[8px] items-center justify-center left-[14px] px-[16px] py-[8px] rounded-[32px]" data-node-id="I1:417;0:393" data-name="Frame">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I1:417;0:395" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-[15px] h-[233px] overflow-clip relative rounded-[36px] shrink-0 w-full" data-node-id="1:418" data-name="Image">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
                <div className="absolute backdrop-blur-[25px] bg-[rgba(255,255,255,0.4)] bottom-[20px] content-stretch flex gap-[8px] items-center justify-center left-[14px] px-[16px] py-[8px] rounded-[32px]" data-node-id="I1:418;0:393" data-name="Frame">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I1:418;0:395" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative" data-node-id="1:419" data-name="Right">
              <div className="backdrop-blur-[15px] h-[273px] overflow-clip relative rounded-[36px] shrink-0 w-full" data-node-id="1:420" data-name="Image">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
                <div className="absolute backdrop-blur-[25px] bg-[rgba(255,255,255,0.4)] bottom-[20px] content-stretch flex gap-[8px] items-center justify-center left-[14px] px-[16px] py-[8px] rounded-[32px]" data-node-id="I1:420;0:393" data-name="Frame">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I1:420;0:395" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-[15px] h-[233px] overflow-clip relative rounded-[36px] shrink-0 w-full" data-node-id="1:421" data-name="Image">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
                <div className="absolute backdrop-blur-[25px] bg-[rgba(255,255,255,0.4)] bottom-[20px] content-stretch flex gap-[8px] items-center justify-center left-[14px] px-[16px] py-[8px] rounded-[32px]" data-node-id="I1:421;0:393" data-name="Frame">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I1:421;0:395" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-[15px] h-[300px] overflow-clip relative rounded-[36px] shrink-0 w-full" data-node-id="1:422" data-name="Image">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
                <div className="absolute backdrop-blur-[25px] bg-[rgba(255,255,255,0.4)] bottom-[20px] content-stretch flex gap-[8px] items-center justify-center left-[14px] px-[16px] py-[8px] rounded-[32px]" data-node-id="I1:422;0:393" data-name="Frame">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I1:422;0:395" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-[15px] h-[299px] overflow-clip relative rounded-[36px] shrink-0 w-full" data-node-id="1:423" data-name="Image">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
                <div className="absolute backdrop-blur-[25px] bg-[rgba(255,255,255,0.4)] bottom-[20px] content-stretch flex gap-[8px] items-center justify-center left-[14px] px-[16px] py-[8px] rounded-[32px]" data-node-id="I1:423;0:393" data-name="Frame">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I1:423;0:395" data-name="Icon">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon1} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute backdrop-blur-[40px] bg-[rgba(243,238,233,0.7)] border-[rgba(255,255,255,0.01)] border-b-[1.5px] border-solid content-stretch flex flex-col items-start left-0 right-0 top-0" data-node-id="1:424" data-name="Stausbar - Header">
        <div className="h-[47px] overflow-clip relative shrink-0 w-full" data-node-id="1:425" data-name="Status Bar / iPhone 13 Pro Max">
          <div className="absolute h-[47px] left-0 top-0 w-[88px]" data-node-id="I1:425;414:12594" data-name="Clock">
            <div className="-translate-x-1/2 absolute content-stretch flex gap-[2px] items-center justify-center left-[calc(50%+30px)] top-[17px]" data-node-id="I1:425;414:12594;414:11598" data-name="Clock">
              <div className="[word-break:break-word] flex flex-col font-['SF_Pro:Semibold'] font-[590] justify-center leading-[0] relative shrink-0 text-[18px] text-black text-center tracking-[-0.5px] whitespace-nowrap" data-node-id="I1:425;414:12594;414:11599" style={{ fontVariationSettings: '"wdth" 100', fontFeatureSettings: '"ss03" 1' }}>
                <p className="leading-[17px]">9:41</p>
              </div>
            </div>
          </div>
          <div className="absolute content-stretch flex gap-[7px] items-center right-[32.95px] top-[18.05px]" data-node-id="I1:425;414:12916" data-name="Indicators group">
            <div className="h-[13.8px] relative shrink-0 w-[22.966px]" data-node-id="I1:425;414:12917" data-name="Signal">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignal} />
            </div>
            <div className="h-[14.375px] relative shrink-0 w-[19.55px]" data-node-id="I1:425;414:12918" data-name="Connection">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgConnection} />
            </div>
            <div className="h-[14.95px] relative shrink-0 w-[31.429px]" data-node-id="I1:425;414:12919" data-name="Battery">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBattery} />
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[12px] items-center justify-center pl-[16px] pr-[24px] py-[12px] relative shrink-0 w-full" data-node-id="1:426" data-name="Home Header">
          <div className="content-stretch flex items-center p-[8px] relative shrink-0" data-node-id="1:427" data-name="Icon Left">
            <div className="flex items-center justify-center relative shrink-0" data-node-id="1:428">
              <div className="-scale-y-100 flex-none rotate-180">
                <div className="overflow-clip relative size-[24px]" data-name="Arrow - Right 3">
                  <div className="absolute contents inset-[23.76%_17.71%_26.04%_19.79%]" data-node-id="I1:428;0:892" data-name="Iconly/Light/Arrow---Right">
                    <div className="absolute flex inset-[23.76%_17.71%_26.04%_19.79%] items-center justify-center" data-node-id="I1:428;0:893" style={{ containerType: "size" }}>
                      <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                        <div className="relative size-full" data-name="Arrow---Right">
                          <div className="absolute inset-[-6.67%_-8.3%]">
                            <img alt="" className="block max-w-none size-full" src={imgArrowRight} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['SF_Pro_Rounded:Semibold'] leading-[24px] min-w-px not-italic relative text-[#0a0a0a] text-[20px]" data-node-id="1:429">
            Back
          </p>
          <div className="flex items-center justify-center relative shrink-0" data-node-id="1:430">
            <div className="-scale-y-100 flex-none rotate-180">
              <div className="bg-[#f0cfe7] overflow-clip relative rounded-[480px] size-[40px]" data-name="Avatar">
                <div className="absolute inset-[0_0_-15.63%_0]" data-node-id="I1:430;872:13086" data-name="nrd-ZmmAnliy1d4-unsplash 1">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgNrdZmmAnliy1D4Unsplash1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}