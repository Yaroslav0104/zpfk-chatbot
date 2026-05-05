import React, { useState, useEffect } from "react";
import { Button, Box, Collapse } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

function ButtonGroup({ options, handleClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Слідкуємо за розміром екрану
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!options || options.length === 0) return null;

  // Якщо кнопок більше 3 і ми на телефоні — ховаємо їх у меню
  const isLargeMenu = isMobile && options.length > 3;
  // В іншому випадку (або якщо меню відкрили) — показуємо
  const showButtons = isLargeMenu ? isOpen : true;

  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      {/* Кнопка-перемикач з'явиться ТІЛЬКИ на телефонах для великих меню */}
      {isLargeMenu && (
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setIsOpen(!isOpen)}
          startIcon={isOpen ? <CloseIcon /> : <MenuIcon />}
          sx={{
            bgcolor: isOpen ? "rgba(239, 68, 68, 0.1)" : "rgba(56, 189, 248, 0.1)",
            color: isOpen ? "#f87171" : "#38bdf8",
            borderColor: isOpen ? "rgba(239, 68, 68, 0.3)" : "rgba(56, 189, 248, 0.3)",
            borderRadius: "12px",
            py: 1.5,
            mb: isOpen ? 2 : 0,
            fontWeight: 700,
            textTransform: "none",
            transition: "all 0.3s ease",
          }}
        >
          {isOpen ? "Сховати меню" : "Відкрити меню команд"}
        </Button>
      )}

      {/* Самі кнопки з плавною анімацією виїзду */}
      <Collapse in={showButtons}>
        <div className="buttons">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                handleClick(option.label, option.next);
                if (isLargeMenu) setIsOpen(false); // Автоматично ховаємо меню після вибору
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Collapse>
    </Box>
  );
}

export default ButtonGroup;