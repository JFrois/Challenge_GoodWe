const assetPathPrefix = "./assets";
const imgIconInfoCircleLine = `${assetPathPrefix}/59ffd.svg`;
const imgIconArrowFullDown = `${assetPathPrefix}/60ed3.svg`;
const imgTesla = `${assetPathPrefix}/d8dce.svg`;
const imgProperty1Down = `${assetPathPrefix}/72ae9.svg`;
const imgProperty1Up = `${assetPathPrefix}/7af1f.svg`;
const imgPhotoThomas = `${assetPathPrefix}/1f837.png`;
const imgPhotoThomas1 = `${assetPathPrefix}/9b4d3.png`;
const imgPhotoThomas2 = `${assetPathPrefix}/2f0c4.png`;
const imgPhotoThomas3 = `${assetPathPrefix}/3ff01.png`;
const imgPhotoThomas4 = `${assetPathPrefix}/1bfd7.png`;
const imgPhotoThomas5 = `${assetPathPrefix}/37454.png`;
const imgPhotoThomas6 = `${assetPathPrefix}/38a48.png`;
const imgPhotoThomas7 = `${assetPathPrefix}/6c4db.png`;
const imgPhotoThomas8 = `${assetPathPrefix}/fda8b.png`;
const imgPhotoThomas9 = `${assetPathPrefix}/edf47.png`;
const imgPhoto = `${assetPathPrefix}/332dc.png`;
const imgRectangle2370 = `${assetPathPrefix}/22668.png`;
const imgRectangle2371 = `${assetPathPrefix}/89fe0.png`;
const imgRectangle2372 = `${assetPathPrefix}/d80f9.png`;
const imgRectangle2373 = `${assetPathPrefix}/071e4.png`;
const imgRectangle2374 = `${assetPathPrefix}/19302.png`;
const imgRectangle2375 = `${assetPathPrefix}/31a04.png`;
const imgIconChevronRight = `${assetPathPrefix}/09030.svg`;
const imgIconChevronRight1 = `${assetPathPrefix}/7fc3f.svg`;
const imgLeaderboardArrow = `${assetPathPrefix}/06dbd.svg`;
const imgLeaderboardArrow1 = `${assetPathPrefix}/9cdfc.svg`;
const imgIconDownload = `${assetPathPrefix}/d50a5.svg`;
const imgVector = `${assetPathPrefix}/71bcb.svg`;
const imgIconPeople = `${assetPathPrefix}/72daa.svg`;
const imgIconQuiz = `${assetPathPrefix}/33daf.svg`;
const imgGroup = `${assetPathPrefix}/7361b.svg`;
const imgIconSettings = `${assetPathPrefix}/b8080.svg`;
const imgIconAssignments = `${assetPathPrefix}/766cb.svg`;
const imgLine20 = `${assetPathPrefix}/9bdfe.svg`;
const imgTesla1 = `${assetPathPrefix}/94570.svg`;
const imgGraph = `${assetPathPrefix}/107d3.svg`;
const imgBounds = `${assetPathPrefix}/20a92.svg`;
const imgIconArrowFullDown1 = `${assetPathPrefix}/9df1e.svg`;
const imgBounds1 = `${assetPathPrefix}/0b8d5.svg`;
const imgBounds2 = `${assetPathPrefix}/b2a39.svg`;
const imgGraph1 = `${assetPathPrefix}/4cad0.svg`;
const imgRectangle188 = `${assetPathPrefix}/dbc95.svg`;
const imgRectangle189 = `${assetPathPrefix}/6767e.svg`;
const imgRectangle190 = `${assetPathPrefix}/a0bda.svg`;
const imgRectangle191 = `${assetPathPrefix}/5c95b.svg`;
const imgRectangle192 = `${assetPathPrefix}/0b323.svg`;
const imgRectangle193 = `${assetPathPrefix}/0c7bd.svg`;
const imgRectangle194 = `${assetPathPrefix}/c082d.svg`;
const imgRectangle195 = `${assetPathPrefix}/943f2.svg`;
const imgRectangle196 = `${assetPathPrefix}/48acb.svg`;
const imgRectangle197 = `${assetPathPrefix}/4e906.svg`;
const imgRectangle198 = `${assetPathPrefix}/aef5c.svg`;
const imgRectangle199 = `${assetPathPrefix}/35e8b.svg`;
const imgRectangle200 = `${assetPathPrefix}/b4032.svg`;
const imgRectangle201 = `${assetPathPrefix}/af713.svg`;
const imgRectangle202 = `${assetPathPrefix}/ff442.svg`;
const imgRectangle203 = `${assetPathPrefix}/a2102.svg`;
const imgRectangle204 = `${assetPathPrefix}/23bfc.svg`;
const imgRectangle205 = `${assetPathPrefix}/84d06.svg`;
const imgRectangle206 = `${assetPathPrefix}/85bec.svg`;
const imgRectangle207 = `${assetPathPrefix}/5cfde.svg`;
const imgRectangle208 = `${assetPathPrefix}/f716c.svg`;
const imgRectangle209 = `${assetPathPrefix}/3c2dc.svg`;
const imgRectangle187 = `${assetPathPrefix}/78ed5.svg`;
const imgRectangle186 = `${assetPathPrefix}/9b618.svg`;
const imgLine23 = `${assetPathPrefix}/a5737.svg`;
const imgIcons = `${assetPathPrefix}/213ea.svg`;

function IconInfoCircleLine({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[16px]"} data-node-id="1:868" data-name="Icon-info-circle-line">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconInfoCircleLine} />
    </div>
  );
}

function IconArrowFullDown({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[24px]"} data-node-id="1:849" data-name="Icon / Arrow Full Down">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconArrowFullDown} />
    </div>
  );
}

function Tesla({ className }: { className?: string }) {
  return (
    <div className={className || "h-[17px] relative w-[138px]"} data-node-id="1:842" data-name="TESLA">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTesla} />
    </div>
  );
}

type LeaderboardArrowProps = {
  className?: string;
  property1?: "Down" | "Up";
};

function LeaderboardArrow({ className, property1 = "Down" }: LeaderboardArrowProps) {
  const isUp = property1 === "Up";
  return (
    <div className={className || "relative size-[12px]"} id={isUp ? "node-1_564" : "node-1_562"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={isUp ? imgProperty1Up : imgProperty1Down} />
    </div>
  );
}

export default function Main() {
  return (
    <div className="bg-[#f9f9f9] overflow-clip relative rounded-[30px] shadow-[0px_0px_50px_0px_rgba(0,0,0,0.1)] size-full" data-node-id="1:926" data-name="Main">
      <div className="absolute content-stretch flex flex-col items-start left-[3208px] top-[558px]" data-node-id="1:927" data-name="Candidates">
        <div className="h-[68px] overflow-clip relative shrink-0 w-[1120px]" data-node-id="1:928" data-name="Candidates">
          <div className="absolute bg-white inset-0" data-node-id="1:929" data-name="Shape" />
          <p className="[word-break:break-word] absolute font-['Roboto:Medium'] font-medium leading-[26px] left-[1.79%] right-[83.93%] text-[#696974] text-[16px] top-[calc(50%-13px)] tracking-[0.1px] whitespace-nowrap" data-node-id="1:930" style={{ fontVariationSettings: '"wdth" 100' }}>
            West Coast Managers
          </p>
          <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[26px] left-[80.45%] right-[16.88%] text-[#696974] text-[16px] top-[calc(50%-13px)] tracking-[0.1px] whitespace-nowrap" data-node-id="1:931" style={{ fontVariationSettings: '"wdth" 100' }}>
            66%
          </p>
          <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[26px] left-[32.41%] right-[65.89%] text-[#696974] text-[16px] top-[calc(50%-13px)] tracking-[0.1px] whitespace-nowrap" data-node-id="1:932" style={{ fontVariationSettings: '"wdth" 100' }}>
            45
          </p>
          <p className="[word-break:break-word] absolute font-['Roboto:Regular'] font-normal leading-[26px] left-[50.89%] right-[46.43%] text-[#696974] text-[16px] top-[calc(50%-13px)] tracking-[0.1px] whitespace-nowrap" data-node-id="1:933" style={{ fontVariationSettings: '"wdth" 100' }}>
            74%
          </p>
        </div>
      </div>
      <div className="absolute bg-[rgba(0,0,0,0.1)] inset-[8.86%_50px_91.05%_280px]" data-node-id="1:934" data-name="Divider" />
      <div className="absolute contents left-[280px] top-[845px]" data-node-id="1:935">
        <div className="absolute border border-[#eff0f6] border-solid h-[797px] left-[843px] overflow-clip rounded-[20px] top-[845px] w-[556px]" data-node-id="1:936" data-name="Row/Leaderboard/Groups">
          <div className="absolute bg-white inset-[-1px_-1px_calc(-1%-1.02px)_-1px] rounded-[20px]" data-node-id="1:937" data-name="Shape" />
          <div className="absolute content-stretch flex flex-col items-start left-[-1px] top-[67px]" data-node-id="1:938" data-name="Frame">
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:939" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:940" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic top-[15px]" data-node-id="1:941">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] text-black w-[220px]" data-node-id="1:942">
                  Houston Facility
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[#808080] text-[12px] whitespace-nowrap" data-node-id="1:943">
                  52 Points / User - 97% Correct
                </p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:944" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:945" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic top-[15px]" data-node-id="1:946">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] text-black w-[220px]" data-node-id="1:947">
                  Test Group
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[#808080] text-[12px] whitespace-nowrap" data-node-id="1:948">
                  52 Points / User - 95% Correct
                </p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:949" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:950" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic top-[15px]" data-node-id="1:951">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] text-black w-[220px]" data-node-id="1:952">
                  Sales Leadership
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[#808080] text-[12px] whitespace-pre" data-node-id="1:953">{`52 Points / User -  87% Correct`}</p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:954" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:955" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic text-black top-[15px]" data-node-id="1:956">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] w-[220px]" data-node-id="1:957">
                  Northeast Region
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] whitespace-nowrap" data-node-id="1:958">
                  52 Points / User
                </p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:959" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:960" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic text-black top-[15px]" data-node-id="1:961">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] w-[220px]" data-node-id="1:962">
                  Southeast Region
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] whitespace-nowrap" data-node-id="1:963">
                  52 Points / User
                </p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:964" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:965" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic text-black top-[15px]" data-node-id="1:966">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] w-[220px]" data-node-id="1:967">
                  District Managers
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] whitespace-nowrap" data-node-id="1:968">
                  52 Points / User
                </p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:969" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:970" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic text-black top-[15px]" data-node-id="1:971">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] w-[220px]" data-node-id="1:972">
                  Senior Managers
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] whitespace-nowrap" data-node-id="1:973">
                  52 Points / User
                </p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:974" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:975" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic text-black top-[15px]" data-node-id="1:976">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] w-[220px]" data-node-id="1:977">
                  New Hires
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] whitespace-nowrap" data-node-id="1:978">
                  52 Points / User
                </p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:979" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:980" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic text-black top-[15px]" data-node-id="1:981">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] w-[220px]" data-node-id="1:982">
                  Southwest Region
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] whitespace-nowrap" data-node-id="1:983">
                  52 Points / User
                </p>
              </div>
            </div>
            <div className="h-[66px] overflow-clip relative shrink-0 w-[320px]" data-node-id="1:984" data-name="Leaderboard Row">
              <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:985" data-name="Background" />
              <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[24px] not-italic text-black top-[15px]" data-node-id="1:986">
                <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] w-[220px]" data-node-id="1:987">
                  Northwest Region
                </p>
                <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] whitespace-nowrap" data-node-id="1:988">
                  52 Points / User
                </p>
              </div>
            </div>
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[calc(4.58%-0.91px)] not-italic right-[calc(54.17%+0.08px)] text-[14px] text-[rgba(0,0,0,0.5)] top-[calc(50%-374.5px)]" data-node-id="1:990">
            Groups Leaderboard
          </p>
          <div className="absolute bg-[rgba(0,0,0,0.1)] inset-[calc(91.34%+0.83px)_-1px_calc(8.53%-0.83px)_-1px]" data-node-id="1:991" data-name="Separator" />
          <div className="absolute contents left-[calc(34.31%-0.31px)] right-[calc(34.96%-0.3px)] top-[752px]" data-node-id="1:992" data-name="Button">
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[34.31%] not-italic right-[39.61%] text-[#1b59f8] text-[14px] top-[calc(50%+355.5px)]" data-node-id="1:993">
              View full leaderboard
            </p>
            <div className="absolute inset-[94.48%_34.96%_3.01%_61.59%]" data-node-id="1:994" data-name="Icon / Chevron-Right">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconChevronRight} />
            </div>
          </div>
          <div className="absolute contents inset-[calc(11.29%-0.77px)_calc(8.33%-0.83px)_calc(86.41%+0.73px)_calc(78.62%+0.57px)]" data-node-id="1:995">
            <LeaderboardArrow className="absolute inset-[11.88%_8.33%_86.74%_89.49%]" property1="Up" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[11.29%_12.68%_86.41%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:997">
              1
            </p>
          </div>
          <div className="absolute contents inset-[calc(19.57%-0.61px)_calc(8.33%-0.83px)_calc(78.13%+0.56px)_calc(78.62%+0.57px)]" data-node-id="1:998">
            <LeaderboardArrow className="absolute inset-[20.16%_8.33%_78.46%_89.49%]" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[19.57%_12.68%_78.13%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1000">
              2
            </p>
          </div>
          <div className="absolute contents inset-[calc(27.85%-0.44px)_calc(8.33%-0.83px)_calc(69.85%+0.4px)_calc(78.62%+0.57px)]" data-node-id="1:1001">
            <LeaderboardArrow className="absolute inset-[28.44%_8.33%_70.18%_89.49%]" property1="Up" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[27.85%_12.68%_69.85%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1003">
              3
            </p>
          </div>
          <div className="absolute contents inset-[calc(36.14%-0.28px)_calc(8.33%-0.83px)_calc(61.56%+0.23px)_calc(78.62%+0.57px)]" data-node-id="1:1004">
            <LeaderboardArrow className="absolute inset-[36.72%_8.33%_61.9%_89.49%]" property1="Up" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[36.14%_12.68%_61.56%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1006">
              4
            </p>
          </div>
          <div className="absolute contents inset-[calc(44.42%-0.11px)_calc(8.33%-0.83px)_calc(53.28%+0.07px)_calc(78.62%+0.57px)]" data-node-id="1:1007">
            <LeaderboardArrow className="absolute inset-[45%_8.33%_53.62%_89.49%]" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[44.42%_12.68%_53.28%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1009">
              5
            </p>
          </div>
          <div className="absolute contents inset-[calc(52.7%+0.05px)_calc(8.33%-0.83px)_calc(45%-0.1px)_calc(78.62%+0.57px)]" data-node-id="1:1010">
            <LeaderboardArrow className="absolute inset-[53.28%_8.33%_45.34%_89.49%]" property1="Up" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[52.7%_12.68%_45%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1012">
              6
            </p>
          </div>
          <div className="absolute contents inset-[calc(60.98%+0.22px)_calc(8.33%-0.83px)_calc(36.72%-0.27px)_calc(78.62%+0.57px)]" data-node-id="1:1013">
            <LeaderboardArrow className="absolute inset-[61.56%_8.33%_37.06%_89.49%]" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[60.98%_12.68%_36.72%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1015">
              7
            </p>
          </div>
          <div className="absolute contents inset-[calc(69.26%+0.39px)_calc(8.33%-0.83px)_calc(28.44%-0.43px)_calc(78.62%+0.57px)]" data-node-id="1:1016">
            <LeaderboardArrow className="absolute inset-[69.85%_8.33%_28.77%_89.49%]" property1="Up" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[69.26%_12.68%_28.44%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1018">
              8
            </p>
          </div>
          <div className="absolute contents inset-[calc(77.54%+0.55px)_calc(8.33%-0.83px)_calc(20.16%-0.6px)_calc(78.62%+0.57px)]" data-node-id="1:1019">
            <LeaderboardArrow className="absolute inset-[78.13%_8.33%_20.49%_89.49%]" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[77.54%_12.68%_20.16%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1021">
              9
            </p>
          </div>
          <div className="absolute contents inset-[calc(85.82%+0.72px)_calc(8.33%-0.83px)_calc(11.88%-0.76px)_calc(78.62%+0.57px)]" data-node-id="1:1022">
            <LeaderboardArrow className="absolute inset-[86.41%_8.33%_12.21%_89.49%]" property1="Up" />
            <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[85.82%_12.68%_11.88%_78.62%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1024">
              10
            </p>
          </div>
        </div>
        <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[72.72%_43.06%_-42%_19.65%] rounded-[20px]" data-node-id="1:1025" data-name="Shape" />
        <div className="absolute inset-[78.57%_58.33%_15.75%_19.44%] overflow-clip" data-node-id="1:1026" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1027" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic top-[15px] whitespace-nowrap" data-node-id="1:1028">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] text-black" data-node-id="1:1029">
              Jesse Thomas
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.5)]" data-node-id="1:1030">
              637 Points - 98% Correct
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1031" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas} width="42" />
          </div>
        </div>
        <div className="absolute inset-[84.25%_58.33%_10.07%_19.44%] overflow-clip" data-node-id="1:1032" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1033" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic top-[15px] whitespace-nowrap" data-node-id="1:1034">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] text-black" data-node-id="1:1035">
              Thisal Mathiyazhagan
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.5)]" data-node-id="1:1036">{`637 Points - 89% Correct `}</p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1037" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas1} width="42" />
          </div>
        </div>
        <div className="absolute inset-[89.93%_58.33%_4.39%_19.44%] overflow-clip" data-node-id="1:1038" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1039" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic top-[15px] whitespace-nowrap" data-node-id="1:1040">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px] text-black" data-node-id="1:1041">
              Helen Chuang
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.5)]" data-node-id="1:1042">
              637 Points - 88% Correct
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1043" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas2} width="42" />
          </div>
        </div>
        <div className="absolute inset-[95.61%_58.33%_-1.29%_19.44%] overflow-clip" data-node-id="1:1044" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1045" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic text-black top-[15px] whitespace-nowrap" data-node-id="1:1046">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px]" data-node-id="1:1047">
              Lura Silverman
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px]" data-node-id="1:1048">
              637 Points
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1049" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas3} width="42" />
          </div>
        </div>
        <div className="absolute inset-[101.29%_58.33%_-6.97%_19.44%] overflow-clip" data-node-id="1:1050" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1051" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic text-black top-[15px] whitespace-nowrap" data-node-id="1:1052">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px]" data-node-id="1:1053">
              Winifred Groton
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px]" data-node-id="1:1054">
              637 Points
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1055" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas4} width="42" />
          </div>
        </div>
        <div className="absolute inset-[106.97%_58.33%_-12.65%_19.44%] overflow-clip" data-node-id="1:1056" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1057" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic text-black top-[15px] whitespace-nowrap" data-node-id="1:1058">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px]" data-node-id="1:1059">
              Ken Alba
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px]" data-node-id="1:1060">
              637 Points
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1061" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas5} width="42" />
          </div>
        </div>
        <div className="absolute inset-[112.65%_58.33%_-18.33%_19.44%] overflow-clip" data-node-id="1:1062" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1063" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic text-black top-[15px] whitespace-nowrap" data-node-id="1:1064">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px]" data-node-id="1:1065">
              Alice LeBeau
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px]" data-node-id="1:1066">
              637 Points
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1067" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas6} width="42" />
          </div>
        </div>
        <div className="absolute inset-[118.33%_58.33%_-24.01%_19.44%] overflow-clip" data-node-id="1:1068" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1069" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic text-black top-[15px] whitespace-nowrap" data-node-id="1:1070">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px]" data-node-id="1:1071">
              Adrian Lu
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px]" data-node-id="1:1072">
              637 Points
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1073" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas7} width="42" />
          </div>
        </div>
        <div className="absolute inset-[124.01%_58.33%_-29.69%_19.44%] overflow-clip" data-node-id="1:1074" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1075" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic text-black top-[15px] whitespace-nowrap" data-node-id="1:1076">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px]" data-node-id="1:1077">
              Evelyn Hamilton
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px]" data-node-id="1:1078">
              637 Points
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1079" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas8} width="42" />
          </div>
        </div>
        <div className="absolute inset-[129.69%_58.33%_-35.37%_19.44%] overflow-clip" data-node-id="1:1080" data-name="Leaderboard Row">
          <div className="absolute inset-[0_-28.13%_0_0]" data-node-id="1:1081" data-name="Background" />
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[4px] items-start left-[78px] not-italic text-black top-[15px] whitespace-nowrap" data-node-id="1:1082">
            <p className="font-['Inter:Semi_Bold'] font-semibold leading-[18px] relative shrink-0 text-[14px]" data-node-id="1:1083">
              Rosa Fiddlebrook
            </p>
            <p className="font-['Inter:Medium'] font-medium leading-[normal] relative shrink-0 text-[12px]" data-node-id="1:1084">
              637 Points
            </p>
          </div>
          <div className="absolute left-[24px] size-[42px] top-[12px]" data-node-id="1:1085" data-name="Photo / Thomas">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="42" src={imgPhotoThomas9} width="42" />
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[309px] not-italic text-[14px] text-[rgba(0,0,0,0.5)] top-[869px] w-[137px]" data-node-id="1:1086">
          User Leaderboard
        </p>
        <div className="absolute bg-[rgba(0,0,0,0.1)] bottom-[-412px] h-px left-[19.44%] right-[43.33%]" data-node-id="1:1087" data-name="Separator" />
        <div className="absolute bottom-[-457px] contents left-[32.36%] right-[56.1%]" data-node-id="1:1088" data-name="Button">
          <p className="[word-break:break-word] absolute bottom-[-438px] font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[32.36%] not-italic right-[57.64%] text-[#1b59f8] text-[14px] translate-y-full" data-node-id="1:1089">
            View full leaderboard
          </p>
          <div className="absolute bottom-[-457px] h-[20px] left-[42.31%] right-[56.1%]" data-node-id="1:1090" data-name="Icon / Chevron-Right">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconChevronRight1} />
          </div>
        </div>
        <div className="absolute contents inset-[80.55%_45.42%_17.87%_49.58%]" data-node-id="1:1091">
          <div className="absolute inset-[80.95%_45.42%_18.1%_53.75%]" data-node-id="1:1092" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[80.55%_47.08%_17.87%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1093">
            1
          </p>
        </div>
        <div className="absolute contents inset-[86.23%_45.42%_12.19%_49.58%]" data-node-id="1:1094">
          <div className="absolute inset-[86.63%_45.42%_12.42%_53.75%]" data-node-id="1:1095" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow1} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[86.23%_47.08%_12.19%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1096">
            2
          </p>
        </div>
        <div className="absolute contents inset-[91.91%_45.42%_6.51%_49.58%]" data-node-id="1:1097">
          <div className="absolute inset-[92.31%_45.42%_6.74%_53.75%]" data-node-id="1:1098" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[91.91%_47.08%_6.51%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1099">
            3
          </p>
        </div>
        <div className="absolute contents inset-[97.59%_45.42%_0.83%_49.58%]" data-node-id="1:1100">
          <div className="absolute inset-[97.99%_45.42%_1.06%_53.75%]" data-node-id="1:1101" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[97.59%_47.08%_0.83%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1102">
            4
          </p>
        </div>
        <div className="absolute contents inset-[103.27%_45.42%_-4.85%_49.58%]" data-node-id="1:1103">
          <div className="absolute inset-[103.67%_45.42%_-4.62%_53.75%]" data-node-id="1:1104" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow1} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[103.27%_47.08%_-4.85%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1105">
            5
          </p>
        </div>
        <div className="absolute contents inset-[108.95%_45.42%_-10.53%_49.58%]" data-node-id="1:1106">
          <div className="absolute inset-[109.35%_45.42%_-10.3%_53.75%]" data-node-id="1:1107" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[108.95%_47.08%_-10.53%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1108">
            6
          </p>
        </div>
        <div className="absolute contents inset-[114.63%_45.42%_-16.21%_49.58%]" data-node-id="1:1109">
          <div className="absolute inset-[115.03%_45.42%_-15.98%_53.75%]" data-node-id="1:1110" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow1} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[114.63%_47.08%_-16.21%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1111">
            7
          </p>
        </div>
        <div className="absolute contents inset-[120.31%_45.42%_-21.89%_49.58%]" data-node-id="1:1112">
          <div className="absolute inset-[120.71%_45.42%_-21.66%_53.75%]" data-node-id="1:1113" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[120.31%_47.08%_-21.89%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1114">
            8
          </p>
        </div>
        <div className="absolute contents inset-[125.99%_45.42%_-27.57%_49.58%]" data-node-id="1:1115">
          <div className="absolute inset-[126.39%_45.42%_-27.34%_53.75%]" data-node-id="1:1116" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow1} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[125.99%_47.08%_-27.57%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1117">
            9
          </p>
        </div>
        <div className="absolute contents inset-[131.67%_45.42%_-33.25%_49.58%]" data-node-id="1:1118">
          <div className="absolute inset-[132.07%_45.42%_-33.02%_53.75%]" data-node-id="1:1119" data-name="Leaderboard Arrow">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLeaderboardArrow} />
          </div>
          <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[131.67%_47.08%_-33.25%_49.58%] leading-[20px] not-italic text-[#151e23] text-[16px] text-right tracking-[-0.2px]" data-node-id="1:1120">
            10
          </p>
        </div>
      </div>
      <div className="-translate-y-1/2 absolute content-stretch flex items-center left-[280px] top-[calc(50%-529.5px)]" data-node-id="1:1121" data-name="Navigation Header">
        <p className="[word-break:break-word] font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[24px] text-black whitespace-nowrap" data-node-id="1:1122">
          Reports
        </p>
      </div>
      <div className="absolute contents left-[1229px] top-[43px]" data-node-id="1:1123">
        <div className="absolute inset-[3.7%_8.68%_94.41%_89.79%]" data-node-id="1:1124" data-name="Icon / Download">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconDownload} />
        </div>
        <div className="-translate-x-full -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] left-[1385.56px] not-italic text-[#4d4d4d] text-[14px] text-right top-[calc(50%-528px)] w-[156.556px]" data-node-id="1:1125">
          <p className="leading-[18px]">{`Download `}</p>
        </div>
      </div>
      <div className="absolute drop-shadow-[0px_5px_10px_rgba(0,0,0,0.05)] h-[1162px] left-0 top-0 w-[230px]" data-node-id="1:1126" data-name="Component 1/Reports">
        <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[0_-6.96%_0_0] overflow-clip rounded-[20px]" data-node-id="I1:1126;455:339792" data-name="Side Nav">
          <div className="absolute content-stretch flex flex-col gap-[40px] items-start left-[-1px] top-[-1px] w-[230px]" data-node-id="I1:1126;455:339793" data-name="Frame">
            <div className="content-stretch flex flex-col h-[70px] items-start justify-center px-[20px] py-[24px] relative shrink-0 w-[250px]" data-node-id="I1:1126;455:339794" data-name="Sidebar / Logo" />
          </div>
          <div className="absolute inset-[calc(10.33%-0.79px)_calc(73.92%+0.48px)_calc(88.68%+0.77px)_calc(17.57%-0.65px)]" data-node-id="I1:1126;455:339815" data-name="Vector">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector} />
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[31.71%_54.78%_66.57%_18.26%] leading-[20px] not-italic text-[16px] text-[rgba(0,0,0,0.5)] tracking-[-0.2px] whitespace-nowrap" data-node-id="I1:1126;455:339837">
          Support
        </p>
        <div className="absolute bg-[rgba(27,89,248,0.1)] inset-[8.86%_4.35%_87.18%_11.74%] rounded-[10px]" data-node-id="I1:1126;455:340028" />
        <p className="[word-break:break-word] absolute font-['Inter:Medium'] font-medium inset-[10.11%_43.48%_88.43%_33.91%] leading-[normal] not-italic text-[#1b59f8] text-[14px] tracking-[-0.154px] whitespace-nowrap" data-node-id="I1:1126;455:339827">
          Reports
        </p>
        <p className="[word-break:break-word] absolute font-['Inter:Medium'] font-medium inset-[19.97%_46.09%_78.57%_33.91%] leading-[normal] not-italic text-[#4d4d4d] text-[14px] tracking-[-0.154px] whitespace-nowrap" data-node-id="I1:1126;455:339828">
          People
        </p>
        <div className="absolute inset-[19.45%_71.53%_78.49%_17.13%]" data-node-id="I1:1126;455:339829" data-name="Icon / People">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconPeople} />
        </div>
        <div className="[word-break:break-word] absolute flex flex-col font-['Inter:Medium'] font-medium inset-[15.06%_45.65%_83.48%_33.91%] justify-center leading-[0] not-italic text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="I1:1126;455:339830">
          <p className="leading-[normal]">Library</p>
        </div>
        <div className="absolute inset-[14.72%_73.04%_83.22%_16.52%]" data-node-id="I1:1126;455:339831" data-name="Icon / Quiz">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconQuiz} />
        </div>
        <div className="[word-break:break-word] absolute flex flex-col font-['Inter:Medium'] font-medium inset-[24.87%_39.57%_73.67%_33.91%] justify-center leading-[0] not-italic text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="I1:1126;455:339832">
          <p className="leading-[normal]">Activities</p>
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Medium'] font-medium inset-[36.19%_32.61%_62.35%_33.91%] leading-[normal] not-italic text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="I1:1126;455:339833">
          Get Started
        </p>
        <div className="absolute inset-[35.89%_73.04%_62.05%_16.52%] overflow-clip" data-node-id="I1:1126;455:339834" data-name="Icon / Bulb">
          <div className="absolute contents inset-[12.5%_20.83%_8.33%_20.82%]" data-node-id="I1:1126;455:339834;611:28" data-name="Group">
            <div className="absolute inset-[12.5%_20.83%_8.33%_20.82%]" data-node-id="I1:1126;455:339834;611:30" data-name="Group">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup} />
            </div>
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Medium'] font-medium inset-[41.09%_42.17%_57.44%_33.91%] leading-[normal] not-italic text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="I1:1126;455:339835">
          Settings
        </p>
        <div className="absolute inset-[40.79%_73.04%_57.14%_16.52%]" data-node-id="I1:1126;455:339836" data-name="Icon / Settings">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconSettings} />
        </div>
        <div className="absolute inset-[24.53%_71.53%_73.41%_17.13%]" data-node-id="I1:1126;455:339838" data-name="Icon / Assignments">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconAssignments} />
        </div>
        <div className="absolute inset-[87.35%_0_12.65%_8.7%]" data-node-id="I1:1126;474:309176">
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine20} />
          </div>
        </div>
        <div className="absolute inset-[90.96%_27.39%_8.21%_39.13%]" data-node-id="I1:1126;474:309177" data-name="TESLA">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTesla1} />
        </div>
        <div className="absolute inset-[90.02%_68.7%_7.06%_16.52%] rounded-[24px]" data-node-id="I1:1126;474:309181" data-name="Photo" />
        <p className="[word-break:break-word] absolute font-['Inter:Regular'] font-normal inset-[95.27%_14.78%_3.44%_17.39%] leading-[normal] not-italic text-[12px] text-[rgba(0,0,0,0.5)] whitespace-nowrap" data-node-id="I1:1126;474:309182">
          samwheeler@example.com
        </p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold inset-[93.72%_43.48%_4.73%_17.39%] leading-[18px] not-italic text-[14px] text-black whitespace-nowrap" data-node-id="I1:1126;474:309183">
          Sam Wheeler
        </p>
      </div>
      <div className="absolute inset-[90.02%_95%_7.06%_2.64%] rounded-[24px]" data-node-id="1:1127" data-name="Photo">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[24px] size-full" src={imgPhoto} />
      </div>
      <Tesla className="absolute inset-[3.7%_87.78%_94.84%_2.64%]" />
      <div className="absolute contents left-[283px] top-[202px]" data-node-id="1:1129">
        <div className="absolute bottom-[749.7px] content-stretch flex h-[16.578px] items-center left-[350.66px] w-[217.682px]" data-node-id="1:1130" data-name="Bottom">
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] w-[148px]" data-node-id="1:1131">{`Out of 43 `}</p>
        </div>
        <div className="absolute contents left-[283px] top-[371.6px]" data-node-id="1:1132">
          <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[31.98%_68.46%_54.91%_19.65%] rounded-[20px]" data-node-id="1:1133" data-name="Bounds" />
          <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[31.98%_55.78%_54.91%_32.34%] rounded-[20px]" data-node-id="1:1134" data-name="Bounds" />
          <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[31.98%_43.13%_54.91%_44.99%] rounded-[20px]" data-node-id="1:1135" data-name="Bounds" />
          <div className="absolute h-[106.56px] left-[293.68px] top-[394.97px] w-[141.192px]" data-node-id="1:1136" data-name="Small Graph">
            <div className="[word-break:break-word] absolute flex flex-col font-['Inter:Bold'] font-bold inset-[33.33%_55.82%_41.23%_5.11%] justify-center leading-[0] not-italic text-[24px] text-black" data-node-id="1:1137">
              <p className="leading-[normal]">64%</p>
            </div>
            <div className="absolute bottom-[80.32%] left-0 top-[-4.77%] w-[130px]" data-node-id="1:1138" data-name="Title" />
          </div>
          <div className="absolute h-[106.56px] left-[476.22px] top-[394.97px] w-[141.192px]" data-node-id="1:1139" data-name="Small Graph">
            <div className="[word-break:break-word] absolute flex flex-col font-['Inter:Bold'] font-bold inset-[33.28%_50.54%_40.83%_4.76%] justify-center leading-[0] not-italic text-[24px] text-black" data-node-id="1:1140">
              <p className="leading-[normal]">86%</p>
            </div>
            <div className="absolute bottom-[89.39%] content-stretch flex items-start left-[7px] top-[-5.35%]" data-node-id="1:1141" data-name="Title">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="1:1142">
                Current Knowledge
              </p>
            </div>
            <div className="absolute inset-[69.48%_-2.05%_-0.82%_4.81%]" data-node-id="1:1143" data-name="Graph">
              <div className="absolute inset-[-2.99%_-0.73%_0_-0.73%]">
                <img alt="" className="block max-w-none size-full" src={imgGraph} />
              </div>
            </div>
          </div>
          <div className="absolute h-[106.56px] left-[658.76px] top-[394.97px] w-[141.192px]" data-node-id="1:1146" data-name="Small Graph">
            <div className="[word-break:break-word] absolute flex flex-col font-['Inter:Bold'] font-bold inset-[33.28%_39.55%_40.83%_4.75%] justify-center leading-[0] not-italic text-[24px] text-black" data-node-id="1:1147">
              <p className="leading-[normal]">+34%</p>
            </div>
            <div className="absolute bottom-[89.39%] content-stretch flex items-start left-[7px] top-[-5.35%]" data-node-id="1:1148" data-name="Title">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="1:1149">
                Knowledge Gain
              </p>
            </div>
            <div className="absolute inset-[69.48%_-1.33%_-0.82%_4.09%]" data-node-id="1:1150" data-name="Graph">
              <div className="absolute inset-[-2.99%_-0.73%_0_-0.73%]">
                <img alt="" className="block max-w-none size-full" src={imgGraph} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute contents left-[283px] top-[202px]" data-node-id="1:1153">
          <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[17.38%_68.46%_69.5%_19.65%] rounded-[20px]" data-node-id="1:1154" data-name="Bounds" />
          <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[17.38%_55.78%_69.5%_32.34%] rounded-[20px]" data-node-id="1:1155" data-name="Bounds" />
          <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[17.38%_43.13%_69.5%_44.99%] rounded-[20px]" data-node-id="1:1156" data-name="Bounds" />
          <div className="absolute h-[106.56px] left-[293.68px] top-[225.37px] w-[141.192px]" data-node-id="1:1157" data-name="Small Graph">
            <div className="[word-break:break-word] absolute flex flex-col font-['Inter:Bold'] font-bold inset-[34.38%_36.03%_40.29%_5.18%] justify-center leading-[0] not-italic text-[0px] text-black" data-node-id="1:1158">
              <p>
                <span className="leading-[normal] text-[24px]">27</span>
                <span className="[word-break:break-word] font-['Inter:Semi_Bold'] font-semibold leading-[22px] not-italic text-[17px] text-[rgba(0,0,0,0.5)]">/80</span>
              </p>
            </div>
            <div className="absolute bottom-[88.59%] content-stretch flex items-start left-[6.32px] top-[-4.55%]" data-node-id="1:1159" data-name="Title">
              <div className="[word-break:break-word] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="1:1160">
                <p className="leading-[normal]">Active Users</p>
              </div>
            </div>
          </div>
          <div className="absolute h-[106.56px] left-[476.22px] top-[225.37px] w-[141.192px]" data-node-id="1:1161" data-name="Small Graph">
            <div className="[word-break:break-word] absolute flex flex-col font-['Inter:Bold'] font-bold inset-[34.38%_35.41%_39.73%_4.76%] justify-center leading-[0] not-italic text-[24px] text-black" data-node-id="1:1162">
              <p className="leading-[normal]">3,298</p>
            </div>
            <div className="absolute bottom-[91.9%] content-stretch flex items-start left-[6.78px] top-[-7.85%]" data-node-id="1:1163" data-name="Title">
              <div className="[word-break:break-word] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="1:1164">
                <p className="leading-[normal]">Questions Answered</p>
              </div>
            </div>
          </div>
          <div className="absolute h-[106.56px] left-[658.76px] top-[225.37px] w-[141.192px]" data-node-id="1:1165" data-name="Small Graph">
            <div className="[word-break:break-word] absolute flex flex-col font-['Inter:Bold'] font-bold inset-[34.38%_16.86%_39.73%_4.75%] justify-center leading-[0] not-italic text-[24px] text-black" data-node-id="1:1166">
              <p className="leading-[normal]">2m 34s</p>
            </div>
            <div className="absolute bottom-[91.9%] content-stretch flex items-start left-[6.24px] top-[-7.85%]" data-node-id="1:1167" data-name="Title">
              <div className="[word-break:break-word] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.7)] tracking-[-0.154px] whitespace-nowrap" data-node-id="1:1168">
                <p className="leading-[normal]">Av. Session Length</p>
              </div>
            </div>
          </div>
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Medium'] font-medium h-[23.209px] leading-[normal] left-[300px] not-italic text-[14px] text-[rgba(0,0,0,0.7)] top-[389.51px] tracking-[-0.154px] w-[191.207px]" data-node-id="1:1169">
          Starting Knowledge
        </p>
      </div>
      <div className="absolute contents left-[283px] top-[132px]" data-node-id="1:1170">
        <div className="absolute contents left-[283px] top-[132px]" data-node-id="1:1171">
          <div className="absolute inset-[11.36%_54.97%_84.42%_19.65%]" data-node-id="1:1172" data-name="Bounds">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBounds} />
          </div>
          <div className="absolute content-stretch flex h-[32.667px] items-center left-[297.99px] rounded-[20px] top-[141px] w-[173.338px]" data-node-id="1:1173" data-name="Date Dropdown">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-black tracking-[-0.3px] whitespace-nowrap" data-node-id="I1:1173;834:136826">
              <p className="text-[16px]">
                <span className="leading-[20px] text-[rgba(0,0,0,0.7)]">{`Timeframe: `}</span>
                <span className="leading-[20px] text-black">All-time</span>
              </p>
            </div>
            <div className="relative shrink-0 size-[24px]" data-node-id="I1:1173;834:136827" data-name="Icon / Arrow Full Down">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconArrowFullDown1} />
            </div>
          </div>
        </div>
        <div className="absolute contents left-[45.71%] right-[28.91%] top-[132px]" data-node-id="1:1174">
          <div className="absolute inset-[11.36%_28.91%_84.42%_45.71%]" data-node-id="1:1175" data-name="Bounds">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBounds1} />
          </div>
          <div className="-translate-y-1/2 absolute contents left-[46.98%] right-[32.93%] top-[calc(50%-424.03px)]" data-node-id="1:1176">
            <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Medium'] font-medium h-[29.944px] justify-center leading-[0] left-[46.98%] not-italic right-[32.93%] text-[0px] text-[rgba(0,0,0,0.7)] top-[calc(50%-424.03px)] tracking-[-0.3px]" data-node-id="1:1177">
              <p className="text-[16px]">
                <span className="leading-[20px]">People</span>
                <span className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[20px] not-italic tracking-[-0.3px]">{`: `}</span>
                <span className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[20px] not-italic text-black tracking-[-0.3px]">All</span>
              </p>
            </div>
          </div>
        </div>
        <div className="absolute contents left-[1033.58px] top-[132px]" data-node-id="1:1178">
          <IconArrowFullDown className="absolute h-[32.667px] left-[1344.1px] top-[140.17px] w-[41.174px]" />
          <div className="absolute contents left-[71.78%] right-[2.85%] top-[132px]" data-node-id="1:1180">
            <div className="absolute inset-[11.36%_2.85%_84.42%_71.78%]" data-node-id="1:1181" data-name="Bounds">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBounds2} />
            </div>
            <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Medium'] font-medium h-[29.944px] justify-center leading-[0] left-[73.06%] not-italic right-[7.52%] text-[0px] text-[rgba(0,0,0,0.7)] top-[calc(50%-424.03px)] tracking-[-0.3px]" data-node-id="1:1182">
              <p className="text-[16px]">
                <span className="leading-[20px]">{`Topic: `}</span>
                <span className="leading-[20px] text-black">All</span>
              </p>
            </div>
          </div>
        </div>
        <IconArrowFullDown className="absolute h-[24px] left-[1365.42px] top-[147px] w-[23.703px]" />
        <IconArrowFullDown className="absolute h-[24px] left-[986.18px] top-[146px] w-[23.703px]" />
        <IconArrowFullDown className="absolute h-[24px] left-[611.87px] top-[146px] w-[23.703px]" />
      </div>
      <div className="absolute inset-[40.36%_69.79%_56.76%_21.6%]" data-node-id="1:1186" data-name="Graph">
        <div className="absolute inset-[-2.99%_-0.81%_0_-0.81%]">
          <img alt="" className="block max-w-none size-full" src={imgGraph1} />
        </div>
      </div>
      <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[17.38%_2.85%_54.91%_58.54%] rounded-[20px] shadow-[0px_5px_20px_0px_rgba(0,0,0,0.05)]" data-node-id="1:1189" data-name="Bounds" />
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[906.5px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[23px]" data-node-id="1:1190">
        <p className="leading-[normal]">JAN</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1029px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[24px]" data-node-id="1:1191">
        <p className="leading-[normal]">APR</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1152px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[24px]" data-node-id="1:1192">
        <p className="leading-[normal]">JUL</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1280px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[28px]" data-node-id="1:1193">
        <p className="leading-[normal]">OCT</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[946.5px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[25px]" data-node-id="1:1194">
        <p className="leading-[normal]">FEB</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1070.5px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[25px]" data-node-id="1:1195">
        <p className="leading-[normal]">MAY</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1194.5px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[29px]" data-node-id="1:1196">
        <p className="leading-[normal]">AUG</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1322.5px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[27px]" data-node-id="1:1197">
        <p className="leading-[normal]">NOV</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[57.06%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[986.5px] not-italic text-[#838383] text-[9px] text-center top-[41.65%] w-[29px]" data-node-id="1:1198">
        <p className="leading-[normal]">MAR</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1113px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[24px]" data-node-id="1:1199">
        <p className="leading-[normal]">JUN</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1236.5px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[25px]" data-node-id="1:1200">
        <p className="leading-[normal]">SEP</p>
      </div>
      <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[56.54%] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[1363.5px] not-italic text-[#838383] text-[9px] text-center top-[41.14%] w-[25px]" data-node-id="1:1201">
        <p className="leading-[normal]">DEC</p>
      </div>
      <div className="absolute h-[199px] left-[903px] top-[272px] w-[10px]" data-node-id="1:1202">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle188} />
      </div>
      <div className="absolute h-[60px] left-[903px] top-[412px] w-[10px]" data-node-id="1:1203">
        <div className="absolute inset-[-16.67%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle189} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[945px] top-[272px] w-[10px]" data-node-id="1:1204">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle190} />
      </div>
      <div className="absolute h-[76px] left-[945px] top-[396px] w-[10px]" data-node-id="1:1205">
        <div className="absolute inset-[-13.16%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle191} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[986px] top-[272px] w-[10px]" data-node-id="1:1206">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle192} />
      </div>
      <div className="absolute h-[76px] left-[986px] top-[396px] w-[10px]" data-node-id="1:1207">
        <div className="absolute inset-[-13.16%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle193} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[1026px] top-[272px] w-[10px]" data-node-id="1:1208">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle194} />
      </div>
      <div className="absolute h-[122px] left-[1026px] top-[350px] w-[10px]" data-node-id="1:1209">
        <div className="absolute inset-[-8.2%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle195} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[1067px] top-[272px] w-[10px]" data-node-id="1:1210">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle196} />
      </div>
      <div className="absolute h-[138px] left-[1067px] top-[334px] w-[10px]" data-node-id="1:1211">
        <div className="absolute inset-[-7.25%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle197} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[1111px] top-[272px] w-[10px]" data-node-id="1:1212">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle198} />
      </div>
      <div className="absolute h-[106px] left-[1111px] top-[366px] w-[10px]" data-node-id="1:1213">
        <div className="absolute inset-[-9.43%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle199} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[1152px] top-[272px] w-[10px]" data-node-id="1:1214">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle200} />
      </div>
      <div className="absolute flex h-[122.559px] items-center justify-center left-[1150.27px] top-[349.44px] w-[10.86px]" data-node-id="1:1215">
        <div className="flex-none rotate-[-0.74deg] skew-x-[-0.33deg]">
          <div className="h-[122.433px] relative w-[10px]">
            <div className="absolute inset-[-8.17%_-100%]">
              <img alt="" className="block max-w-none size-full" src={imgRectangle201} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[199px] left-[1192px] top-[272px] w-[10px]" data-node-id="1:1216">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle202} />
      </div>
      <div className="absolute h-[60px] left-[1192px] top-[412px] w-[10px]" data-node-id="1:1217">
        <div className="absolute inset-[-16.67%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle203} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[1233px] top-[272px] w-[10px]" data-node-id="1:1218">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle204} />
      </div>
      <div className="absolute h-[138px] left-[1233px] top-[334px] w-[10px]" data-node-id="1:1219">
        <div className="absolute inset-[-7.25%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle205} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[1275px] top-[272px] w-[10px]" data-node-id="1:1220">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle206} />
      </div>
      <div className="absolute h-[166px] left-[1275px] top-[306px] w-[10px]" data-node-id="1:1221">
        <div className="absolute inset-[-6.02%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle207} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[1315px] top-[272px] w-[10px]" data-node-id="1:1222">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle208} />
      </div>
      <div className="absolute h-[182px] left-[1315px] top-[290px] w-[10px]" data-node-id="1:1223">
        <div className="absolute inset-[-5.49%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle209} />
        </div>
      </div>
      <div className="absolute h-[199px] left-[1357px] top-[272px] w-[10px]" data-node-id="1:1224">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle187} />
      </div>
      <div className="absolute h-[200px] left-[1357px] top-[272px] w-[10px]" data-node-id="1:1225">
        <div className="absolute inset-[-5%_-100%]">
          <img alt="" className="block max-w-none size-full" src={imgRectangle186} />
        </div>
      </div>
      <div className="[word-break:break-word] absolute bottom-[59.81%] contents font-['Inter:Semi_Bold'] font-semibold leading-[12.612px] left-[863px] not-italic text-[9.746px] text-black text-right top-[23.32%]" data-node-id="1:1226">
        <p className="-translate-x-full absolute bottom-[75.53%] left-[886.14px] opacity-50 top-[23.32%] w-[21.957px]" data-node-id="1:1227">
          400
        </p>
        <p className="-translate-x-full absolute bottom-[71.6%] left-[886.14px] opacity-50 top-[27.25%] w-[21.957px]" data-node-id="1:1228">
          300
        </p>
        <p className="-translate-x-full absolute bottom-[67.67%] left-[886.14px] opacity-50 top-[31.19%] w-[21.957px]" data-node-id="1:1229">
          200
        </p>
        <p className="-translate-x-full absolute bottom-[63.74%] left-[886.14px] opacity-50 top-[35.12%] w-[21.957px]" data-node-id="1:1230">
          100
        </p>
        <p className="-translate-x-full absolute bottom-[59.81%] left-[884.96px] opacity-50 top-[39.05%] w-[21.957px]" data-node-id="1:1231">
          0
        </p>
      </div>
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] left-[863px] not-italic text-[#4d4d4d] text-[14px] top-[225.5px] tracking-[-0.154px] w-[238px]" data-node-id="1:1232">
        <p className="leading-[normal]">Activity</p>
      </div>
      <div className="absolute h-0 left-[863px] top-[245px] w-[511px]" data-node-id="1:1233">
        <div className="absolute inset-[-0.8px_0_0_0]">
          <img alt="" className="block max-w-none size-full" src={imgLine23} />
        </div>
      </div>
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center leading-[0] left-[1323px] not-italic text-[#0f2552] text-[12px] top-[228.5px] tracking-[0.02px] w-[46px]" data-node-id="1:1234">
        <p className="leading-[normal]">Month</p>
      </div>
      <div className="absolute flex items-center justify-center left-[1361px] size-[16px] top-[220px]" data-node-id="1:1235">
        <div className="-rotate-90 flex-none">
          <div className="relative size-[16px]" data-name="Icons">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcons} />
          </div>
        </div>
      </div>
      <div className="absolute contents left-[283px] top-[541px]" data-node-id="1:1236">
        <div className="absolute contents left-[283px] top-[541px]" data-node-id="1:1237">
          <div className="absolute contents left-[19.65%] right-[43.05%] top-[541px]" data-node-id="1:1238">
            <div className="absolute contents left-[19.65%] right-[43.05%] top-[541px]" data-node-id="1:1239">
              <div className="absolute contents left-[19.65%] right-[43.05%] top-[541px]" data-node-id="1:1240">
                <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[46.56%_43.05%_29.35%_19.65%] rounded-[20px]" data-node-id="1:1241" data-name="Bounds" />
                <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[8.853px] justify-center leading-[0] left-[21.44%] not-italic right-[62.37%] text-[14px] text-[rgba(0,0,0,0.5)] top-[calc(50%-10.57px)]" data-node-id="1:1242">
                  <p className="leading-[18px]">{`Weakest Topics `}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute contents left-[377px] top-[604px]" data-node-id="1:1243">
            <div className="absolute contents left-[377px] top-[604px]" data-node-id="1:1244">
              <div className="absolute content-stretch flex gap-[20px] items-center left-[379.96px] top-[604px] w-[307.584px]" data-node-id="1:1245">
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-node-id="1:1247" data-name="Everything But the Photo">
                  <div className="col-1 h-[32px] ml-0 mt-0 relative row-1 w-[364px]" data-node-id="1:1248" />
                </div>
              </div>
              <div className="absolute content-stretch flex gap-[20px] items-center left-[379.96px] top-[672px] w-[308.573px]" data-node-id="1:1249">
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-node-id="1:1251" data-name="Everything But the Photo">
                  <div className="col-1 h-[32px] ml-0 mt-0 relative row-1 w-[322px]" data-node-id="1:1252" />
                </div>
              </div>
              <div className="absolute h-[32px] left-[379.96px] top-[740px] w-[263.996px]" data-node-id="1:1253" />
              <div className="absolute inset-[65.58%_52.25%_33.56%_26.18%] opacity-20 rounded-[100px]" data-node-id="1:1254" style={{ backgroundImage: "linear-gradient(178.61654110770223deg, rgb(255, 191, 26) 5.3571%, rgb(255, 64, 128) 94.643%)" }} data-name="Adjustable Progress Bar" />
              <div className="-translate-y-1/2 absolute contents left-[377px] top-[calc(50%+186px)]" data-node-id="1:1255">
                <div className="-translate-y-1/2 absolute h-[10px] left-[377px] rounded-[100px] top-[calc(50%+186px)] w-[147.028px]" data-node-id="1:1256" style={{ backgroundImage: "linear-gradient(177.0798313154471deg, rgb(255, 191, 26) 5.3571%, rgb(255, 64, 128) 94.643%)" }} data-name="Progress" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute h-[32px] left-[311.72px] rounded-[6px] top-[604px] w-[49.451px]" data-node-id="1:1257">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle2370} />
        </div>
        <div className="absolute h-[32px] left-[311.72px] rounded-[6px] top-[672px] w-[49.451px]" data-node-id="1:1258">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle2371} />
        </div>
        <div className="absolute h-[32px] left-[311.72px] rounded-[6px] top-[740px] w-[49.451px]" data-node-id="1:1259">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle2372} />
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[377px] not-italic text-[14px] text-black top-[calc(50%+159px)] w-[179px]" data-node-id="1:1260">
          Company Networking
        </p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[377px] not-italic text-[14px] text-black top-[calc(50%+91px)] w-[217px]" data-node-id="1:1261">{`Compliance Basics Procedures `}</p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[377px] not-italic text-[14px] text-black top-[calc(50%+23px)] w-[91.979px]" data-node-id="1:1262">
          Food Safety
        </p>
        <div className="absolute inset-[54.22%_52.25%_44.92%_26.18%] opacity-20 rounded-[100px]" data-node-id="1:1263" style={{ backgroundImage: "linear-gradient(178.61654110770223deg, rgb(255, 191, 26) 5.3571%, rgb(255, 64, 128) 94.643%)" }} data-name="Adjustable Progress Bar" />
        <div className="absolute inset-[59.72%_52.25%_39.41%_26.18%] opacity-20 rounded-[100px]" data-node-id="1:1264" style={{ backgroundImage: "linear-gradient(178.61654110770223deg, rgb(255, 191, 26) 5.3571%, rgb(255, 64, 128) 94.643%)" }} data-name="Adjustable Progress Bar" />
        <div className="-translate-y-1/2 absolute contents left-[377px] top-[calc(50%+54px)]" data-node-id="1:1265">
          <div className="-translate-y-1/2 absolute h-[10px] left-[377px] rounded-[100px] top-[calc(50%+54px)] w-[250.221px]" data-node-id="1:1266" style={{ backgroundImage: "linear-gradient(178.28315998436102deg, rgb(255, 191, 26) 5.3571%, rgb(255, 64, 128) 94.643%)" }} data-name="Progress" />
        </div>
        <div className="-translate-y-1/2 absolute contents left-[377px] top-[calc(50%+118px)]" data-node-id="1:1267">
          <div className="-translate-y-1/2 absolute h-[10px] left-[377px] rounded-[100px] top-[calc(50%+118px)] w-[179.012px]" data-node-id="1:1268" style={{ backgroundImage: "linear-gradient(177.6009027638939deg, rgb(255, 191, 26) 5.3571%, rgb(255, 64, 128) 94.643%)" }} data-name="Progress" />
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[0] not-italic right-[737px] text-[14px] text-[rgba(0,0,0,0.7)] top-[calc(50%+42px)] translate-x-full w-[96px]" data-node-id="1:1269">
          <span className="leading-[18px]">{`74% `}</span>
          <span className="leading-[18px] text-[rgba(0,0,0,0.3)]">Correct</span>
        </p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[0] not-italic right-[737px] text-[14px] text-[rgba(0,0,0,0.7)] top-[calc(50%+110px)] translate-x-full w-[96px]" data-node-id="1:1270">
          <span className="leading-[18px]">{`52% `}</span>
          <span className="leading-[18px] text-[rgba(0,0,0,0.3)]">Correct</span>
        </p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[0] not-italic right-[736.63px] text-[14px] text-[rgba(0,0,0,0.7)] top-[calc(50%+177px)] translate-x-full w-[95.935px]" data-node-id="1:1271">
          <span className="leading-[18px]">{`36% `}</span>
          <span className="leading-[18px] text-[rgba(0,0,0,0.3)]">Correct</span>
        </p>
      </div>
      <div className="absolute contents left-[842.74px] top-[541px]" data-node-id="1:1272">
        <div className="absolute contents left-[842.74px] top-[541px]" data-node-id="1:1273">
          <div className="absolute contents left-[58.52%] right-[2.85%] top-[541px]" data-node-id="1:1274">
            <div className="absolute contents left-[58.52%] right-[2.85%] top-[541px]" data-node-id="1:1275">
              <div className="absolute contents left-[58.52%] right-[2.85%] top-[541px]" data-node-id="1:1276">
                <div className="absolute bg-white border border-[#eff0f6] border-solid inset-[46.56%_2.85%_29.35%_58.52%] rounded-[20px]" data-node-id="1:1277" data-name="Bounds" />
                <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inter:Semi_Bold'] font-semibold h-[8.101px] justify-center leading-[0] left-[60.31%] not-italic right-[22.92%] text-[14px] text-[rgba(0,0,0,0.5)] top-[calc(50%-10.95px)]" data-node-id="1:1278">
                  <p className="leading-[18px]">Strongest Topics</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute contents left-[940.1px] top-[604px]" data-node-id="1:1279">
            <div className="absolute contents left-[940.1px] top-[604px]" data-node-id="1:1280">
              <div className="absolute content-stretch flex gap-[20px] items-center left-[943.17px] top-[604px] w-[318.569px]" data-node-id="1:1281">
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-node-id="1:1283" data-name="Everything But the Photo">
                  <div className="col-1 h-[32px] ml-0 mt-0 relative row-1 w-[364px]" data-node-id="1:1284" />
                </div>
              </div>
              <div className="absolute content-stretch flex gap-[20px] items-center left-[943.17px] top-[672px] w-[319.594px]" data-node-id="1:1285">
                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-node-id="1:1287" data-name="Everything But the Photo">
                  <div className="col-1 h-[32px] ml-0 mt-0 relative row-1 w-[322px]" data-node-id="1:1288" />
                </div>
              </div>
              <div className="absolute h-[32px] left-[943.17px] top-[740px] w-[273.424px]" data-node-id="1:1289" />
              <div className="absolute inset-[65.58%_12.38%_33.56%_65.28%] opacity-20 rounded-[100px]" data-node-id="1:1290" style={{ backgroundImage: "linear-gradient(-89.99999747130497deg, rgb(47, 234, 155) 15.5%, rgb(127, 221, 83) 85.5%)" }} data-name="Adjustable Progress Bar" />
              <div className="-translate-y-1/2 absolute contents left-[940.1px] top-[calc(50%+186px)]" data-node-id="1:1291">
                <div className="-translate-y-1/2 absolute h-[10px] left-[940.1px] rounded-[100px] top-[calc(50%+186px)] w-[152.279px]" data-node-id="1:1292" style={{ backgroundImage: "linear-gradient(-89.99999880281067deg, rgb(47, 234, 155) 15.5%, rgb(127, 221, 83) 85.5%)" }} data-name="Progress" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute h-[32px] left-[872.49px] rounded-[6px] top-[604px] w-[51.217px]" data-node-id="1:1293">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle2373} />
        </div>
        <div className="absolute h-[32px] left-[872.49px] rounded-[6px] top-[672px] w-[51.217px]" data-node-id="1:1294">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle2374} />
        </div>
        <div className="absolute h-[32px] left-[872.49px] rounded-[6px] top-[740px] w-[51.217px]" data-node-id="1:1295">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[6px] size-full" src={imgRectangle2375} />
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[940.1px] not-italic text-[14px] text-black top-[calc(50%+159px)] w-[145.456px]" data-node-id="1:1296">
          Social Media Policies
        </p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[940px] not-italic text-[14px] text-black top-[calc(50%+91px)] w-[186px]" data-node-id="1:1297">{`Cyber Security Basics `}</p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[18px] left-[940px] not-italic text-[14px] text-black top-[calc(50%+23px)] w-[152px]" data-node-id="1:1298">{`Covid Protocols `}</p>
        <div className="absolute inset-[54.22%_12.38%_44.92%_65.28%] opacity-20 rounded-[100px]" data-node-id="1:1299" style={{ backgroundImage: "linear-gradient(-89.99999747130497deg, rgb(47, 234, 155) 15.5%, rgb(127, 221, 83) 85.5%)" }} data-name="Adjustable Progress Bar" />
        <div className="absolute inset-[59.72%_12.38%_39.41%_65.28%] opacity-20 rounded-[100px]" data-node-id="1:1300" style={{ backgroundImage: "linear-gradient(-89.99999747130497deg, rgb(47, 234, 155) 15.5%, rgb(127, 221, 83) 85.5%)" }} data-name="Adjustable Progress Bar" />
        <div className="-translate-y-1/2 absolute contents left-[940.1px] top-[calc(50%+54px)]" data-node-id="1:1301">
          <div className="-translate-y-1/2 absolute h-[10px] left-[940.1px] rounded-[100px] top-[calc(50%+54px)] w-[259.158px]" data-node-id="1:1302" style={{ backgroundImage: "linear-gradient(-89.99999796254846deg, rgb(47, 234, 155) 15.5%, rgb(127, 221, 83) 85.5%)" }} data-name="Progress" />
        </div>
        <div className="-translate-y-1/2 absolute contents left-[940.1px] top-[calc(50%+118px)]" data-node-id="1:1303">
          <div className="-translate-y-1/2 absolute h-[10px] left-[940.1px] rounded-[100px] top-[calc(50%+118px)] w-[185.405px]" data-node-id="1:1304" style={{ backgroundImage: "linear-gradient(-89.99999854237646deg, rgb(47, 234, 155) 15.5%, rgb(127, 221, 83) 85.5%)" }} data-name="Progress" />
        </div>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[0] not-italic right-[161.87px] text-[14px] text-[rgba(0,0,0,0.7)] top-[calc(50%+42px)] translate-x-full w-[86.044px]" data-node-id="1:1305">
          <span className="leading-[18px]">{`95% `}</span>
          <span className="leading-[18px] text-[rgba(0,0,0,0.3)]">Correct</span>
        </p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[0] not-italic right-[161.87px] text-[14px] text-[rgba(0,0,0,0.7)] top-[calc(50%+110px)] translate-x-full w-[87.069px]" data-node-id="1:1306">
          <span className="leading-[18px]">{`92% `}</span>
          <span className="leading-[18px] text-[rgba(0,0,0,0.3)]">Correct</span>
        </p>
        <p className="[word-break:break-word] absolute font-['Inter:Semi_Bold'] font-semibold leading-[0] not-italic right-[161.87px] text-[14px] text-[rgba(0,0,0,0.7)] top-[calc(50%+177px)] translate-x-full w-[99.361px]" data-node-id="1:1307">
          <span className="leading-[18px]">{`89% `}</span>
          <span className="leading-[18px] text-[rgba(0,0,0,0.3)]">Correct</span>
        </p>
      </div>
      <IconInfoCircleLine className="absolute left-[435px] size-[11px] top-[394px]" />
    </div>
  );
}