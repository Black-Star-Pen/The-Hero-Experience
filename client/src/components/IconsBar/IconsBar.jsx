import "./IconsBar.css";
import PropTypes from "prop-types";
import { FaTheaterMasks } from "react-icons/fa";
import { TbBallFootball } from "react-icons/tb";
import { BsBoxSeam } from "react-icons/bs";
import { PiStudentBold, PiDetectiveBold, PiMusicNoteFill } from "react-icons/pi";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { LuPartyPopper } from "react-icons/lu";

function IconsBar({filterHeroesByOccupation}) {

    return(
        <div className="icons-bar">
        <button className="sport" type="button" onClick={() => filterHeroesByOccupation(["boxer","ballerina","fighter","judo"])}>
        <TbBallFootball/>
        <p className="text">Sport</p>
        </button>
        <button className="moving" type="button" onClick={() => filterHeroesByOccupation(["titan","destroyer","retired"])}>
        <BsBoxSeam/>
        <p className="text">Demenagement</p>
        </button>
        <button className="cours" type="button" onClick={() => filterHeroesByOccupation(["professor","student","teacher"])}>
        <PiStudentBold/>
        <p className="text">Aide aux devoirs</p>
        </button>
        <button className="outils" type="button" onClick={() => filterHeroesByOccupation(["electronics technician","architect","construction"])}>
        <HiOutlineWrenchScrewdriver/>
        <p className="text">Travaux</p>
        </button>
        <button className="acting" type="button" onClick={() => filterHeroesByOccupation(["actor","artist","actress"])}>
        <FaTheaterMasks />
        <p className="text">Acteurs</p>
        </button>
        <button className="party" type="button" onClick={() => filterHeroesByOccupation(["musician","florist","magician","singer"])}>
        <LuPartyPopper/>
        <p className="text">Evenements</p>
        </button>
        <button className="detective" type="button" onClick={() => filterHeroesByOccupation(["investigator","tracker","spy","journalist"])}>
        <PiDetectiveBold/>
        <p className="text">detective</p>
        </button>
        <button className="music" type="button" onClick={() => filterHeroesByOccupation(["musician","singer"])}> 
        <PiMusicNoteFill/>
        <p className="text">Cours de musique</p>
        </button>
       </div>
        
 )
}

IconsBar.propTypes = {
    filterHeroesByOccupation: PropTypes.func.isRequired
}


export default IconsBar;
