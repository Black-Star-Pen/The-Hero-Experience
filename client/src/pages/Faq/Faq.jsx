
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer'
import './Faq.css'

function Faq() {
    
  return (
    <>
    <Header/>
    <div className='size'>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography className='title' style={{fontFamily:"Poppins"}}>Quels types de services proposons-nous ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{fontFamily:"Poppins"}}>
          Nous proposons une gamme variée de services, allant des déménagements aux animations d'événements 
          en passant par les cours de sport et bien d'autres encore. 
          Consultez notre catalogue pour découvrir toutes nos offres.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography className='title' style={{fontFamily:"Poppins"}}>Comment fonctionne la location d'un super-héros ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{fontFamily:"Poppins"}}>
          C'est simple ! Vous parcourez notre catalogue en ligne, choisissez le super-héros et le service désiré, 
          sélectionnez la date qui vous convient, puis procédez au paiement sécurisé. 
          Votre super-héros sera alors prêt à intervenir selon vos besoins.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography className='title' style={{fontFamily:"Poppins"}}>Quels super-héros sont disponibles à la location ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{fontFamily:"Poppins"}}>
          Nous avons une équipe diversifiée de super-héros prêts à répondre à vos demandes. 
          De la force surhumaine à la maîtrise des éléments, en passant par la vitesse fulgurante et la télépathie, 
          nos héros ont une large variété de compétences à votre service.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography className='title' style={{fontFamily:"Poppins"}}>Comment garantissez-vous la sécurité de vos clients lors des interventions ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{fontFamily:"Poppins"}}>
          La sécurité de nos clients est notre priorité absolue. 
          Tous nos super-héros sont formés pour effectuer leurs tâches de manière professionnelle et sécurisée. 
          De plus, nous avons une assurance couvrant toutes les interventions.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography className='title' style={{fontFamily:"Poppins"}}>Puis-je demander un super-héros spécifique pour ma réservation ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{fontFamily:"Poppins"}}>
          Absolument ! Vous pouvez spécifier le super-héros que vous préférez lors de votre réservation, sous réserve de sa disponibilité. 
          Nous ferons de notre mieux pour répondre à votre demande.          
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography className='title' style={{fontFamily:"Poppins"}}>Quels sont les tarifs de location ?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{fontFamily:"Poppins"}}>
          Nos tarifs varient en fonction du service demandé, de la durée de l'intervention et du super-héros choisi. 
          Vous trouverez des détails sur les tarifs spécifiques sur notre site web.          
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
    <Footer />
    </>
  )
}

export default Faq