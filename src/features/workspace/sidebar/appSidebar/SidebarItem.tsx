export const SidebarItem = (props: {
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={props.onClick}
      className={`shadow-2xl hover:scale-110 ease-in-out duration-100 flex items-center justify-center w-10 h-10 cursor-pointer rounded-xl border-solid border-[#65E0C1] ${props.active ? 'bg-[#65e0c1a4] border-[1px]' : ' hover:bg-[#65e0c172]'} `}
    >
      <div className={`${props.active ? 'opacity-100' : 'opacity-60'}`}>
        {props.icon}
      </div>
    </div>
  );
};
