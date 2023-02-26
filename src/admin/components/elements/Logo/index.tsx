import React from 'react';
import RenderCustomComponent from '../../../components/utilities/RenderCustomComponent';

const DefaultLogo: React.FC = () => {
  return (
    <svg
      width="30px"
      height="30px"
      viewBox="0 0 200 200"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="matrix(2.63642,0,0,2.63642,-87.2329,-53.7489)">
        <path d="M199.429,88.778C197.42,88.779 195.767,90.433 195.767,92.442C195.767,92.443 195.767,92.444 195.767,92.445C195.767,94.454 197.42,96.108 199.429,96.109C201.438,96.108 203.091,94.454 203.09,92.445C203.09,92.444 203.09,92.443 203.09,92.442C203.09,90.433 201.438,88.78 199.429,88.778ZM199.438,95.697C197.672,95.693 196.221,94.241 196.219,92.475C196.219,90.698 201.212,95.697 199.438,95.697ZM187.237,85.914L209.966,77.074L172.874,82.702L162.596,86.319L195.224,85.782L187.237,85.914ZM80.33,43.089L93.395,56.166L93.395,30.011L80.33,43.089ZM95.381,42.067L107.429,42.067L95.381,30.01L95.381,42.067ZM64.445,30L64.445,87.122L92.978,58.557L64.445,30ZM35,30.075L62.464,57.54L62.464,30.075L35,30.075Z" />
      </g>
    </svg>
  );
};

const Logo: React.FC = () => {
  return <RenderCustomComponent CustomComponent={undefined} DefaultComponent={DefaultLogo} />;
};

export default Logo;
